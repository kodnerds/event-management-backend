import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists, mockShows, mockUsers } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

import type { AuthenticatedUser } from '../../src/types';

const CREATE_SHOW_ROUTE = '/shows/create';
const CREATE_ARTIST_ROUTE = '/artists/signup';
const RSVP_ROUTE = (showId: string) => `/shows/${showId}/rsvp`;
const CANCEL_RSVP_ROUTE = (rsvpId: string) => `/rsvps/${rsvpId}`;
const GET_RSVP = (id: string) => `/shows/${id}/rsvps`;
const CREATE_USER_ROUTE = '/users/signup';
const GET_SHOWS_ROUTE = '/shows';
const DELETE_SHOW_ROUTE = (showId: string) => `/shows/${showId}`;

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

  const createArtistAndShow = async (
    showData = mockShows.valid,
    artistData = mockArtists.valid
  ) => {
    const artistRes = await factory.app
      .post(CREATE_ARTIST_ROUTE)
      .send(artistData)
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

  describe('GET /shows', () => {
    it('should retrieve shows successfully with pagination', async () => {
      await createArtistAndShow(
        {
          ...mockShows.valid,
          title: 'Show A',
          date: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
        },
        { ...mockArtists.valid, email: 'artist-a@test.com' }
      );
      await createArtistAndShow(
        {
          ...mockShows.valid,
          title: 'Show B',
          date: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
        },
        { ...mockArtists.valid, email: 'artist-b@test.com' }
      );

      const res = await factory.app.get(GET_SHOWS_ROUTE).expect(HTTP_STATUS.OK);

      expect(res.body).toMatchObject({
        message: 'Shows fetched successfully',
        data: {
          items: expect.any(Array),
          pagination: {
            currentPage: expect.any(Number),
            totalPages: expect.any(Number),
            totalItems: expect.any(Number)
          }
        }
      });
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter shows by artistId', async () => {
      const artistRes1 = await factory.app
        .post(CREATE_ARTIST_ROUTE)
        .send({ ...mockArtists.valid, email: 'artist1@test.com', name: 'Artist One' })
        .expect(HTTP_STATUS.CREATED);
      const artist1Token = generateTestAuthToken(artistRes1.body.data);
      const artist1Id = artistRes1.body.data.id;

      await factory.app
        .post(CREATE_SHOW_ROUTE)
        .set('Authorization', `Bearer ${artist1Token}`)
        .send({ ...mockShows.valid, title: 'Artist1 Show 1' })
        .expect(HTTP_STATUS.CREATED);

      await factory.app
        .post(CREATE_SHOW_ROUTE)
        .set('Authorization', `Bearer ${artist1Token}`)
        .send({ ...mockShows.valid, title: 'Artist1 Show 2' })
        .expect(HTTP_STATUS.CREATED);

      await createArtistAndShow({ ...mockShows.valid, title: 'Other Artist Show' });

      const res = await factory.app
        .get(`${GET_SHOWS_ROUTE}?artistId=${artist1Id}`)
        .expect(HTTP_STATUS.OK);

      expect(res.body.data.items.length).toBe(2);
      expect(
        (res.body.data.items as Array<{ artistId: string }>).every(
          (show) => show.artistId === artist1Id
        )
      ).toBe(true);
    });

    it('should filter shows by date range', async () => {
      const day1 = new Date(Date.now() + 24 * 3600 * 1000);
      const day2 = new Date(Date.now() + 48 * 3600 * 1000);
      const day3 = new Date(Date.now() + 72 * 3600 * 1000);

      await createArtistAndShow(
        {
          ...mockShows.valid,
          title: 'Day 1 Show',
          date: day1.toISOString()
        },
        { ...mockArtists.valid, email: 'artist-day1@test.com' }
      );
      await createArtistAndShow(
        {
          ...mockShows.valid,
          title: 'Day 2 Show',
          date: day2.toISOString()
        },
        { ...mockArtists.valid, email: 'artist-day2@test.com' }
      );
      await createArtistAndShow(
        {
          ...mockShows.valid,
          title: 'Day 3 Show',
          date: day3.toISOString()
        },
        { ...mockArtists.valid, email: 'artist-day3@test.com' }
      );

      const res = await factory.app
        .get(`${GET_SHOWS_ROUTE}?from=${day1.toISOString()}&to=${day2.toISOString()}`)
        .expect(HTTP_STATUS.OK);

      const titles = (res.body.data.items as Array<{ title: string }>).map((show) => show.title);
      expect(titles).toContain('Day 1 Show');
      expect(titles).toContain('Day 2 Show');
      expect(titles).not.toContain('Day 3 Show');
    });

    it('should validate invalid query parameters', async () => {
      // page=0 should default to page=1, not return 400
      const res = await factory.app
        .get(`${GET_SHOWS_ROUTE}?page=0&limit=10`)
        .expect(HTTP_STATUS.OK);
      expect(res.body.data.pagination.currentPage).toBe(1);

      await factory.app
        .get(`${GET_SHOWS_ROUTE}?artistId=00000000-0000-0000-0000-000000000000`)
        .expect(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe('GET /shows/:id/rsvps', () => {
    it('should allow the artist to successfully retrieve RSVPs for their show', async () => {
      const { showId, artistToken } = await createArtistAndShow();

      //Create 2 users and RSVP
      const { userToken: user1Token } = await createUser();
      const { userToken: user2Token } = await createUser(mockUsers.anotherUser);

      await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.CREATED);
      await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(HTTP_STATUS.CREATED);

      const fetchResponse = await factory.app
        .get(GET_RSVP(showId))
        .set('Authorization', `Bearer ${artistToken}`)
        .expect(HTTP_STATUS.OK);

      expect(fetchResponse.body).toMatchObject({
        message: 'RSVPs fetched successfully',
        data: {
          page: 1,
          totalPages: 1,
          totalCount: 2,
          records: expect.any(Array)
        }
      });

      expect(fetchResponse.body.data.records.length).toBe(2);
      expect(fetchResponse.body.data.records[0]).toHaveProperty('user.email');
      expect(fetchResponse.body.data.records[0]).toHaveProperty('status', 'REGISTERED');
    });

    it('should deny access to a regular user who is not the artist', async () => {
      //Create artist and show
      const { showId } = await createArtistAndShow();

      //Create a normal user
      const { userToken } = await createUser();

      //User fetching RSVPs should be denied
      const userResponse = await factory.app
        .get(GET_RSVP(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.FORBIDDEN);

      expect(userResponse.body).toEqual({
        message: 'Forbidden: You do not have permission to access this resource.'
      });
    });

    it('should return 404 when no RSVPs exist for a show', async () => {
      const { showId, artistToken } = await createArtistAndShow();

      const existResponse = await factory.app
        .get(GET_RSVP(showId))
        .set('Authorization', `Bearer ${artistToken}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(existResponse.body).toEqual({
        message: 'No RSVPs found for this show'
      });
    });
  });

  describe('DELETE /shows/:id', () => {
    it('should successfully delete a show with no RSVPs', async () => {
      const { showId, artistToken } = await createArtistAndShow();

      const response = await factory.app
        .delete(DELETE_SHOW_ROUTE(showId))
        .set('Authorization', `Bearer ${artistToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toEqual({
        message: 'Show deleted successfully',
        data: {
          id: showId,
          title: mockShows.valid.title
        }
      });

      // Verify show was deleted
      await factory.app.get(`/shows/${showId}`).expect(HTTP_STATUS.NOT_FOUND);
    });

    it('should cancel a show with RSVPs instead of deleting it', async () => {
      const { showId, artistToken } = await createArtistAndShow();
      const { userToken } = await createUser();

      // Create an RSVP
      await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      // Attempt to delete the show
      const response = await factory.app
        .delete(DELETE_SHOW_ROUTE(showId))
        .set('Authorization', `Bearer ${artistToken}`)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toMatchObject({
        message: 'Show cancelled successfully',
        data: {
          id: showId,
          title: mockShows.valid.title,
          isCancelled: true
        }
      });

      // Verify show still exists
      const getResponse = await factory.app.get(`/shows/${showId}`).expect(HTTP_STATUS.OK);
      expect(getResponse.body.data).toBeDefined();
    });

    it('should return 403 when a non-owner artist tries to delete a show', async () => {
      const { showId } = await createArtistAndShow();

      // Create another artist
      const otherArtistRes = await factory.app
        .post(CREATE_ARTIST_ROUTE)
        .send({ ...mockArtists.valid, email: 'other@test.com', name: 'Other Artist' })
        .expect(HTTP_STATUS.CREATED);
      const otherArtistToken = generateTestAuthToken(otherArtistRes.body.data);

      const response = await factory.app
        .delete(DELETE_SHOW_ROUTE(showId))
        .set('Authorization', `Bearer ${otherArtistToken}`)
        .expect(HTTP_STATUS.FORBIDDEN);

      expect(response.body).toEqual({
        message: 'Forbidden: You do not have permission to delete this show'
      });
    });

    it('should return 401 when no authorization token is provided', async () => {
      const { showId } = await createArtistAndShow();

      const response = await factory.app
        .delete(DELETE_SHOW_ROUTE(showId))
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toEqual({
        message: 'User is not authorized or token is missing'
      });
    });
  });

  describe('DELETE /rsvps/:id', () => {
    it('should successfully cancel an RSVP and increment available tickets', async () => {
      const showWithLimitedTickets = {
        ...mockShows.valid,
        title: 'Limited Tickets Show for Cancel',
        availableTickets: 10
      };
      const { showId } = await createArtistAndShow(showWithLimitedTickets);
      const { userToken } = await createUser();

      // Create RSVP
      const rsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      const rsvpId = rsvpRes.body.data.id;

      // Cancel RSVP
      const cancelRes = await factory.app
        .delete(CANCEL_RSVP_ROUTE(rsvpId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.OK);

      expect(cancelRes.body).toMatchObject({
        message: 'RSVP cancelled successfully',
        data: {
          id: rsvpId,
          showId,
          status: 'CANCELLED'
        }
      });

      // Verify tickets incremented
      const showRes = await factory.app.get(`/shows/${showId}`).expect(HTTP_STATUS.OK);
      expect(showRes.body.data.availableTickets).toBe(10);
    });

    it('should handle authorization and validation errors correctly', async () => {
      const { showId } = await createArtistAndShow();
      const { userToken: user1Token } = await createUser();
      const { userToken: user2Token } = await createUser(mockUsers.anotherUser);

      // User 1 creates RSVP
      const rsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.CREATED);

      const rsvpId = rsvpRes.body.data.id;

      // Unauthorized user tries to cancel
      const unauthorizedRes = await factory.app
        .delete(CANCEL_RSVP_ROUTE(rsvpId))
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(HTTP_STATUS.FORBIDDEN);

      expect(unauthorizedRes.body).toEqual({
        message: 'You are not authorized to cancel this RSVP'
      });

      // Invalid RSVP ID format
      const invalidIdRes = await factory.app
        .delete(CANCEL_RSVP_ROUTE('invalid-id'))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(invalidIdRes.body).toHaveProperty('message', 'Validation error');

      // Non-existent RSVP
      const nonExistentRsvpId = '550e8400-e29b-41d4-a716-446655440000';
      const notFoundRes = await factory.app
        .delete(CANCEL_RSVP_ROUTE(nonExistentRsvpId))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.NOT_FOUND);

      expect(notFoundRes.body).toEqual({
        message: 'RSVP not found'
      });
    });

    it('should prevent duplicate cancellations and allow re-registration', async () => {
      const { showId } = await createArtistAndShow();
      const { userToken } = await createUser();

      // Create RSVP
      const rsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      const rsvpId = rsvpRes.body.data.id;

      // Cancel RSVP
      await factory.app
        .delete(CANCEL_RSVP_ROUTE(rsvpId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.OK);

      // Try to cancel again
      const duplicateCancelRes = await factory.app
        .delete(CANCEL_RSVP_ROUTE(rsvpId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(duplicateCancelRes.body).toEqual({
        message: 'RSVP is already cancelled'
      });

      // RSVP again (should succeed and reuse same ID)
      const newRsvpRes = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HTTP_STATUS.CREATED);

      expect(newRsvpRes.body).toMatchObject({
        message: 'RSVP successful',
        data: {
          id: rsvpId,
          showId,
          status: 'REGISTERED'
        }
      });
    });

    it('should exclude cancelled RSVPs from RSVP count', async () => {
      const { showId } = await createArtistAndShow();
      const { userToken: user1Token } = await createUser();
      const { userToken: user2Token } = await createUser(mockUsers.anotherUser);

      // User 1 RSVPs
      const rsvp1Res = await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.CREATED);

      // User 2 RSVPs
      await factory.app
        .post(RSVP_ROUTE(showId))
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(HTTP_STATUS.CREATED);

      // Verify RSVP count is 2
      let showRes = await factory.app.get(`/shows/${showId}`).expect(HTTP_STATUS.OK);
      expect(showRes.body.data.rsvpCount).toBe(2);

      // User 1 cancels
      await factory.app
        .delete(CANCEL_RSVP_ROUTE(rsvp1Res.body.data.id))
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(HTTP_STATUS.OK);

      // Verify RSVP count is now 1 (cancelled RSVPs not counted)
      showRes = await factory.app.get(`/shows/${showId}`).expect(HTTP_STATUS.OK);
      expect(showRes.body.data.rsvpCount).toBe(1);
    });
  });
});
