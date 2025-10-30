import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists, mockShows, mockUsers } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

import type { AuthenticatedUser } from '../../src/types';

const CREATE_SHOW_ROUTE = '/shows/create';
const CREATE_ARTIST_ROUTE = '/artists/signup';
const RSVP_ROUTE = (showId: string) => `/shows/${showId}/rsvp`;
const CREATE_USER_ROUTE = '/users/signup';

describe('Show routes', () => {
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

  describe('POST /shows/create', () => {
    const artistUser: AuthenticatedUser = {
      id: 'd0a0370e-6985-49e3-8273-d9d68d7412ff',
      email: 'artist@test.com',
      role: 'ARTIST',
      name: 'Test Artist'
    };

    it('should create a new show successfully', async () => {
      const res = await factory.app
        .post(CREATE_ARTIST_ROUTE)
        .send(mockArtists.valid)
        .expect(HTTP_STATUS.CREATED);
      const token = generateTestAuthToken(res.body.data);

      const response = await factory.app
        .post(CREATE_SHOW_ROUTE)
        .set('Authorization', `Bearer ${token}`)
        .send(mockShows.valid);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toMatchObject({
        message: 'Show created successfully',
        data: {
          title: mockShows.valid.title,
          artistId: expect.any(String),
          date: new Date(mockShows.valid.date).toISOString()
        }
      });
      expect(response.body.data).toHaveProperty('id');
    });

    it('Should fail validation for missing or invalid fields', async () => {
      const token = generateTestAuthToken(artistUser);
      const response = await factory.app
        .post(CREATE_SHOW_ROUTE)
        .set('Authorization', `Bearer ${token}`)
        .send(mockShows.invalid);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(response.body.errors).toBeDefined();
    });

    it('should return 401 when no authorization token is provided', async () => {
      const response = await factory.app.post(CREATE_SHOW_ROUTE).send(mockShows.valid);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'User is not authorized or token is missing'
      });
    });

    it('should return 401 when token is invalid', async () => {
      const response = await factory.app
        .post(CREATE_SHOW_ROUTE)
        .set('Authorization', 'Bearer invalid.token.here')
        .send(mockShows.valid);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'User is not authorized or token is invalid'
      });
    });
  });

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

  describe('GET /shows/:id', () => {
    it('should successfully fetch show details by ID', async () => {
      const { showId } = await createArtistAndShow();

      const response = await factory.app.get(`/shows/${showId}`).expect(HTTP_STATUS.OK);

      expect(response.body).toMatchObject({
        message: 'Show details fetched successfully',
        data: {
          id: showId,
          title: mockShows.valid.title,
          location: mockShows.valid.location,
          artist: {
            id: expect.any(String),
            name: mockArtists.valid.name
          },
          rsvpCount: 0
        }
      });
    });

    it('should return 404 when attempting to fetch non-existent show', async () => {
      const nonExistentShowId = '0725a2c6-eb2b-4d6b-8e84-d781fb9fdbdc';

      const response = await factory.app
        .get(`/shows/${nonExistentShowId}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(response.body).toEqual({
        message: 'Show not found'
      });
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await factory.app.get('/shows/invalid-id').expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('message', 'Validation error');
    });
  });
});
