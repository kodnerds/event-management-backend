import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists, mockShows, mockUsers } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

import type { AuthenticatedUser } from '../../src/types';

const CREATE_SHOW_ROUTE = '/shows/create';
const CREATE_ARTIST_ROUTE = '/artists/signup';
const RSVP_ROUTE = (showId: string) => `/shows/${showId}/rsvp`;
const CREATE_USER_ROUTE = '/users/signup';
const GET_SHOWS_ROUTE = '/shows';

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
});

const GET_SHOWS_ROUTE = '/shows';

describe('GET /shows', () => {
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

  const createArtistAndGetToken = async (overrides: Partial<typeof mockArtists.valid> = {}) => {
    const uniqueEmail =
      overrides.email ?? `artist+${Date.now()}${Math.random().toString(16).slice(2)}@example.com`;
    const payload = { ...mockArtists.valid, ...overrides, email: uniqueEmail };
    const res = await factory.app
      .post(CREATE_ARTIST_ROUTE)
      .send(payload)
      .expect(HTTP_STATUS.CREATED);
    const token = generateTestAuthToken(res.body.data);
    return { token, artistId: res.body.data.id };
  };

  const createShow = async (token: string, overrides: Partial<typeof mockShows.valid> = {}) => {
    const payload = { ...mockShows.valid, ...overrides };
    return await factory.app
      .post(CREATE_SHOW_ROUTE)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HTTP_STATUS.CREATED);
  };

  it('should retrieve shows successfully', async () => {
    const { token } = await createArtistAndGetToken();
    await createShow(token, {
      title: 'Show A',
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    });
    await createShow(token, {
      title: 'Show B',
      date: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
    });

    const res = await factory.app.get(GET_SHOWS_ROUTE).expect(HTTP_STATUS.OK);

    expect(res.body).toMatchObject({ message: 'Shows fetched successfully' });
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data).toHaveProperty('pagination');
  });

  it('should filter shows by artistId', async () => {
    const artist1 = await createArtistAndGetToken({ name: 'Artist One' });
    const artist2 = await createArtistAndGetToken({ name: 'Artist Two' });

    await createShow(artist1.token, { title: 'Artist1 Show 1' });
    await createShow(artist1.token, { title: 'Artist1 Show 2' });
    await createShow(artist2.token, { title: 'Artist2 Show 1' });

    const res = await factory.app
      .get(`${GET_SHOWS_ROUTE}?artistId=${artist1.artistId}`)
      .expect(HTTP_STATUS.OK);

    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(
      (res.body.data.items as Array<{ artistId: string }>).every(
        (s) => s.artistId === artist1.artistId
      )
    ).toBe(true);
  });

  it('should filter shows by date range', async () => {
    const { token } = await createArtistAndGetToken();

    const day1 = new Date();
    day1.setDate(day1.getDate() + 1);
    const day2 = new Date();
    day2.setDate(day2.getDate() + 2);
    const day3 = new Date();
    day3.setDate(day3.getDate() + 3);

    await createShow(token, { title: 'D1', date: day1.toISOString() });
    await createShow(token, { title: 'D2', date: day2.toISOString() });
    await createShow(token, { title: 'D3', date: day3.toISOString() });

    const res = await factory.app
      .get(`${GET_SHOWS_ROUTE}?from=${day1.toISOString()}&to=${day2.toISOString()}`)
      .expect(HTTP_STATUS.OK);

    const titles = (res.body.data.items as Array<{ title: string }>).map((s) => s.title);
    expect(titles).toEqual(expect.arrayContaining(['D1', 'D2']));
    expect(titles).not.toEqual(expect.arrayContaining(['D3']));
  });

  it('should support pagination', async () => {
    const { token } = await createArtistAndGetToken();

    for (let i = 0; i < 12; i++) {
      await createShow(token, {
        title: `P${i}`,
        date: new Date(Date.now() + (i + 1) * 3600 * 1000).toISOString()
      });
    }

    const resPage1 = await factory.app
      .get(`${GET_SHOWS_ROUTE}?page=1&limit=5`)
      .expect(HTTP_STATUS.OK);
    expect(resPage1.body.data.items.length).toBe(5);
    expect(resPage1.body.data.pagination.currentPage).toBe(1);

    const resPage2 = await factory.app
      .get(`${GET_SHOWS_ROUTE}?page=2&limit=5`)
      .expect(HTTP_STATUS.OK);
    expect(resPage2.body.data.items.length).toBe(5);
    expect(resPage2.body.data.pagination.currentPage).toBe(2);
  });

  it('should validate invalid query params', async () => {
    const res1 = await factory.app
      .get(`${GET_SHOWS_ROUTE}?page=0&limit=10`)
      .expect(HTTP_STATUS.BAD_REQUEST);
    expect(res1.body).toHaveProperty('message', 'Invalid pagination parameters');

    const res2 = await factory.app
      .get(`${GET_SHOWS_ROUTE}?page=abc&limit=10`)
      .expect(HTTP_STATUS.BAD_REQUEST);
    expect(res2.body).toHaveProperty('message', 'Invalid pagination parameters');

    const res3 = await factory.app
      .get(`${GET_SHOWS_ROUTE}?artistId=00000000-0000-0000-0000-000000000000`)
      .expect(HTTP_STATUS.BAD_REQUEST);
    expect(res3.body).toHaveProperty('message', 'Artist not found');
  });
});

describe('DELETE /shows/:id', () => {
  const factory = new TestFactory();

  const CREATE_ARTIST_ROUTE = '/artists/signup';
  const CREATE_SHOW_ROUTE = '/shows/create';

  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  afterEach(async () => {
    await factory.reset();
  });

  const createArtistAndToken = async (overrides: Partial<typeof mockArtists.valid> = {}) => {
    const uniqueEmail =
      overrides.email ?? `artist+${Date.now()}${Math.random().toString(16).slice(2)}@example.com`;
    const payload = { ...mockArtists.valid, ...overrides, email: uniqueEmail };
    const res = await factory.app
      .post(CREATE_ARTIST_ROUTE)
      .send(payload)
      .expect(HTTP_STATUS.CREATED);
    const token = generateTestAuthToken(res.body.data);
    const artistId = res.body.data.id as string;
    return { token, artistId };
  };

  const createShowAndReturnId = async (
    token: string,
    overrides: Partial<typeof mockShows.valid> = {}
  ): Promise<string> => {
    const payload = { ...mockShows.valid, ...overrides };
    const res = await factory.app
      .post(CREATE_SHOW_ROUTE)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HTTP_STATUS.CREATED);
    return res.body.data.id as string;
  };

  it('should delete a show with no RSVPs (200)', async () => {
    const { token } = await createArtistAndToken();
    const showId = await createShowAndReturnId(token, {
      title: `Del-NoRSVP-${Date.now()}`,
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    });

    const res = await factory.app
      .delete(`/shows/${showId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(res.body).toEqual({ message: 'Show deleted successfully' });
  });

  it('should cancel a show with RSVPs (200, isCancelled=true)', async () => {
    const { token } = await createArtistAndToken();
    const showId = await createShowAndReturnId(token, {
      title: `Cancel-WithRSVP-${Date.now()}`,
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    });

    await factory.app
      .post(`/shows/${showId}/rsvp`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.CREATED);

    const res = await factory.app
      .delete(`/shows/${showId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.OK);

    expect(res.body).toMatchObject({
      message: 'Show cancelled successfully',
      data: { id: showId, isCancelled: true }
    });
  });

  it('should forbid deletion by non-owner (403)', async () => {
    const owner = await createArtistAndToken({ name: 'Owner' });
    const attacker = await createArtistAndToken({ name: 'Attacker' });
    const showId = await createShowAndReturnId(owner.token, {
      title: `Owned-${Date.now()}`,
      date: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    });

    const res = await factory.app
      .delete(`/shows/${showId}`)
      .set('Authorization', `Bearer ${attacker.token}`)
      .expect(HTTP_STATUS.FORBIDDEN);

    expect(res.body).toHaveProperty('message', 'Forbidden');
  });

  it('should return 404 for non-existent show', async () => {
    const { token } = await createArtistAndToken();
    const nonExistentId = '11111111-1111-4111-8111-111111111111';

    const res = await factory.app
      .delete(`/shows/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HTTP_STATUS.NOT_FOUND);

    expect(res.body).toHaveProperty('message', 'Show not found');
  });
});
