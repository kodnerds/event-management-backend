import axios from 'axios';

import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists, mockShows } from '../mocks/data';
import { generatePaystackSignature, generateTestAuthToken } from '../mocks/utils';

const mockUsers = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    role: 'USER'
  },
  anotherUser: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'AnotherPass456@',
    role: 'USER'
  }
};

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

//const INITIATE_PAYMENT = (showId:string) => `/shows/${showId}/rsvp/pay`;
const CREATE_SHOW_ROUTE = '/shows/create';
const CREATE_ARTIST_ROUTE = '/artists/signup';
const CREATE_USER_ROUTE = '/users/signup';
const PAYMENT_ROUTE = (showId: string) => `/payments/initiate/${showId}`;
const WEBHOOK_ROUTE = '/payments/paystack/webhook';

describe('Payment  routes', () => {
  const factory = new TestFactory();

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  afterEach(async () => {
    await factory.reset();
  });

  // Helper function to create artist and show
  const createArtistAndShow = async (showData = mockShows.valid) => {
    const artistRes = await factory.app
      .post(CREATE_ARTIST_ROUTE)
      .send(mockArtists.valid)
      .expect(HTTP_STATUS.CREATED);
    const artistToken = generateTestAuthToken(artistRes.body.data);

    const showRes = await factory.app
      .post(CREATE_SHOW_ROUTE)
      .set('Authorization', `Bearer ${artistToken}`)
      .send(showData)
      .expect(HTTP_STATUS.CREATED);

    return { showId: showRes.body.data.id, artistToken };
  };

  const createArtistAndFreeShow = async () => {
    const artistResponse = await factory.app
      .post(CREATE_ARTIST_ROUTE)
      .send(mockArtists.valid)
      .expect(HTTP_STATUS.CREATED);
    const artistToken = generateTestAuthToken(artistResponse.body.data);

    const freeShow = { ...mockShows.valid, ticketPrice: 0 };
    const showResponse = await factory.app
      .post(CREATE_SHOW_ROUTE)
      .set('Authorization', `Bearer ${artistToken}`)
      .send(freeShow)
      .expect(HTTP_STATUS.CREATED);

    return { showId: showResponse.body.data.id, artistToken };
  };

  // Helper function to create user
  const createUser = async (userData = mockUsers.valid) => {
    const userRes = await factory.app
      .post(CREATE_USER_ROUTE)
      .send(userData)
      .expect(HTTP_STATUS.CREATED);

    const userToken = generateTestAuthToken({
      id: userRes.body.data.id,
      email: userData.email,
      role: 'USER',
      name: `${userData.firstName} ${userData.lastName}`
    });

    return { userId: userRes.body.data.id, userToken };
  };

  describe('POST /shows/:showId/rsvp/pay', () => {
    it('should initialize a payment successfully', async () => {
      const { userToken } = await createUser();
      const { showId } = await createArtistAndShow();

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: true,
          message: 'Authorization URL created',
          data: {
            authorization_url: 'https://paystack.com/pay/fakeurl',
            reference: 'RSVP_abc123'
          }
        }
      });

      const paymentResponse = await factory.app
        .post(PAYMENT_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      expect(paymentResponse.body).toMatchObject({
        message: 'Payment Initialized successfully',
        authorizationUrl: 'https://paystack.com/pay/fake123',
        reference: /^RSVP_/
      });
    });

    it('should prevent duplicate active payments', async () => {
      const { userToken } = await createUser();
      const { showId } = await createArtistAndShow();

      mockedAxios.post.mockResolvedValue({
        data: {
          status: true,
          data: { authorization_url: 'https://paystack.com/pay/abc123' }
        }
      });

      await factory.app
        .post(PAYMENT_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      const paymentResponse = await factory.app
        .post(PAYMENT_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CONFLICT);

      expect(paymentResponse.body.message).toBe('An active payment already exists for this RSVP');
    });
  });

  it('should handle Paystack webhook for successful payment event', async () => {
    const eventPayload = {
      event: 'charge.success',
      data: {
        reference: 'RSVP_abc123',
        amount: 20000,
        status: 'success'
      }
    };

    const validSignature = generatePaystackSignature(eventPayload);

    const webhookResponse = await factory.app
      .post(WEBHOOK_ROUTE)
      .set('x-paystack-signature', validSignature)
      .send(eventPayload)
      .expect(HTTP_STATUS.OK);

    expect(webhookResponse.body.message).toBe('Webhook processed successfully');
  });

  it('should automatically RSVP shows without payment', async () => {
    const { showId } = await createArtistAndFreeShow();
    const { userToken } = await createUser();

    const rsvpResponse = await factory.app
      .post(PAYMENT_ROUTE(showId))
      .set('Authorization', `Bearer ${userToken}`)
      .expect(HTTP_STATUS.BAD_REQUEST);

    expect(rsvpResponse.body.message).toMatch('This show is free,no payment required');
  });

  it('should handle failed payment event', async () => {
    const eventPayload = {
      event: 'charge.failed',
      data: {
        reference: 'RSVP_abc123',
        amount: 200000,
        status: 'failed'
      }
    };

    const failedResponse = await factory.app
      .post(WEBHOOK_ROUTE)
      .set('x-paystack-signature', 'FAKE_SIGNATURE')
      .send(eventPayload);

    expect(failedResponse.status).toBe(HTTP_STATUS.OK);
    expect(failedResponse.body.message).toMatch(/Payment failed/i);
  });
});
