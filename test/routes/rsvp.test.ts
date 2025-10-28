import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists, mockShows } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

const CREATE_SHOW_ROUTE = '/shows/create';
const CREATE_ARTIST_ROUTE = '/artists/signup';
const CREATE_USER_ROUTE = '/users/signup';

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

const RSVP_ROUTE = (showId: string) => `/shows/${showId}/rsvp`;

describe('RSVP routes', () => {
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

  describe('POST /shows/:showId/rsvp', () => {
    it('should allow a user to successfully RSVP for a show', async () => {
      const { showId } = await createArtistAndShow();
      const { userId, userToken } = await createUser();

      const rsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      expect(rsvpRes.body).toMatchObject({
        message: 'RSVP successful',
        data: {
          id: expect.any(String),
          userId,
          showId,
          status: 'REGISTERED'
        }
      });
    });

    it('should return 400 when show does not exist', async () => {
      const { userToken } = await createUser();
      const nonExistentShowId = '00000000-0000-0000-0000-000000000000';

      const rsvpRes = await factory.app
        .post(RSVP_ROUTE(nonExistentShowId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(rsvpRes.body).toEqual({
        message: 'Show does not exist'
      });
    });

    it('should return 409 when user tries to RSVP twice for the same show', async () => {
      const { showId } = await createArtistAndShow();
      const { userToken } = await createUser();

      // First RSVP
      await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      // Second RSVP attempt
      const secondRsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CONFLICT);

      expect(secondRsvpRes.body).toEqual({
        message: 'User already registered for this show'
      });
    });

    it('should return 400 when show is sold out', async () => {
      const showWithLimitedTickets = {
        ...mockShows.valid,
        title: 'Limited Tickets Show',
        availableTickets: 1
      };
      const { showId } = await createArtistAndShow(showWithLimitedTickets);

      // Create first user and RSVP
      const { userToken: user1Token } = await createUser();
      await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.CREATED);

      // Create second user and attempt RSVP (should fail - sold out)
      const { userToken: user2Token } = await createUser(mockUsers.anotherUser);
      const rsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(rsvpRes.body).toEqual({
        message: 'Show is sold out'
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      const { showId } = await createArtistAndShow();

      const rsvpRes = await factory.app.post(RSVP_ROUTE(showId)).expect(HTTP_STATUS.UNAUTHORIZED);

      expect(rsvpRes.body).toEqual({
        message: 'User is not authorized or token is missing'
      });
    });
  });
});
