import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists, mockShows } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

import type { AuthenticatedUser } from '../../src/types';

const CREATE_SHOW_ROUTE = '/shows/create';
const CREATE_ARTIST_ROUTE = '/artists/signup';

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
