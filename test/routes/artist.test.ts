import { ArtistRepository } from '../../src/repositories';
import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

import type { AuthenticatedUser } from '../../src/types';

const SIGNUP_ROUTE = '/artists/signup';
const GET_ARTISTS_ROUTE = '/artists';
const ARTIST_ME_ROUTE = '/artists/me';
const UPDATE_ARTIST_ROUTE = (id: string) => `/artists/update/${id}`;

describe('Artist routes', () => {
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

  describe('POST /artists/signup', () => {
    it('should create a new artist with valid data', async () => {
      const res = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);

      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body).toMatchObject({
        message: 'Artist created successfully',
        data: { name: mockArtists.valid.name }
      });
      expect(res.body.data).toHaveProperty('id');
    });

    it('should create an artist without optional bio', async () => {
      const res = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.validWithoutBio);

      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should return 409 when email already exists', async () => {
      await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      const res = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);

      expect(res.status).toBe(HTTP_STATUS.CONFLICT);
      expect(res.body.message).toBe('Email already exists.');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'J',
        email: 'invalid-email',
        password: 'weak',
        genre: []
      };
      const res = await factory.app.post(SIGNUP_ROUTE).send(invalidData);

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /artists', () => {
    it('should retrieve all artists with limited fields', async () => {
      await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      await factory.app.post(SIGNUP_ROUTE).send(mockArtists.validWithoutBio);

      const response = await factory.app.get(GET_ARTISTS_ROUTE);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      const firstResponse = response.body.data[0];

      expect(firstResponse).toHaveProperty('id');
      expect(firstResponse).toHaveProperty('name');
      expect(firstResponse).toHaveProperty('genre');
      expect(firstResponse).toHaveProperty('bio');
      expect(firstResponse).toHaveProperty('email');
    });

    it('should return empty array when no artists exist', async () => {
      const response = await factory.app.get(GET_ARTISTS_ROUTE);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.message).toBe('Artists retrieved successfully');
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(ArtistRepository.prototype, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(GET_ARTISTS_ROUTE);
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('GET /api/artists/me', () => {
    const artistUser: AuthenticatedUser = {
      id: '123',
      email: 'artist@test.com',
      role: 'ARTIST',
      name: 'Test Artist'
    };

    it('should return current artist data when authenticated with ARTIST role', async () => {
      const token = generateTestAuthToken(artistUser);

      const response = await factory.app
        .get(ARTIST_ME_ROUTE)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        message: 'Current artist',
        data: {
          id: artistUser.id,
          email: artistUser.email,
          role: artistUser.role,
          name: artistUser.name
        }
      });
    });

    it('should return 401 when no authorization token is provided', async () => {
      const response = await factory.app.get(ARTIST_ME_ROUTE);

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'User is not authorized or token is missing'
      });
    });

    it('should return 401 when token is invalid', async () => {
      const response = await factory.app
        .get(ARTIST_ME_ROUTE)
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'User is not authorized or token is invalid'
      });
    });

    it('should return 403 when user does not have ARTIST role', async () => {
      const userWithWrongRole: AuthenticatedUser = {
        ...artistUser,
        role: 'USER'
      };

      const token = generateTestAuthToken(userWithWrongRole);

      const response = await factory.app
        .get(ARTIST_ME_ROUTE)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden: You do not have permission to access this resource.'
      });
    });
  });

  describe('PATCH /artists/update/:id', () => {
    it('should successfully update artist profile (partial/full update allowed)', async () => {
      const createArtist = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      const artistId = createArtist.body.data.id;

      const updatePayload = {
        name: 'Johnny Updated',
        genre: ['Jazz', 'Soul'],
        bio: 'Updated bio content.'
      };

      const updateArtist = await factory.app
        .patch(UPDATE_ARTIST_ROUTE(artistId))
        .send(updatePayload);

      expect(updateArtist.status).toBe(200);
      expect(updateArtist.body).toMatchObject({
        message: 'Artist updated successfully',
        data: {
          id: artistId,
          name: updatePayload.name,
          genre: updatePayload.genre,
          bio: updatePayload.bio
        }
      });
      expect(updateArtist.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid genre type (not array)', async () => {
      const createArtist = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      const artistId = createArtist.body.data.id;

      const invalidPayload = {
        genre: 'NotAnArray'
      };

      const updateArtist = await factory.app
        .patch(UPDATE_ARTIST_ROUTE(artistId))
        .send(invalidPayload);

      expect(updateArtist.status).toBe(400);
      expect(updateArtist.body).toHaveProperty('message', 'Validation error');
      expect(updateArtist.body.errors[0]).toMatch(/Genre must be a non-empty array/);
    });

    it('should return 400 for empty name', async () => {
      const createArtist = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      const artistId = createArtist.body.data.id;

      const invalidPayload = {
        name: ''
      };

      const updateArtist = await factory.app
        .patch(UPDATE_ARTIST_ROUTE(artistId))
        .send(invalidPayload);

      expect(updateArtist.status).toBe(400);
      expect(updateArtist.body.errors[0]).toMatch(/Name must be a non-empty string/);
    });

    it('should return 400 when trying to update restricted fields (email,password', async () => {
      const createArtist = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      const artistId = createArtist.body.data.id;

      const invalidPayload = {
        email: 'newemail@example.com',
        password: 'NewPassword123!'
      };

      const updateArtist = await factory.app
        .patch(UPDATE_ARTIST_ROUTE(artistId))
        .send(invalidPayload);

      expect(updateArtist.status).toBe(400);
      expect(updateArtist.body.message).toBe('Validation error');

      const errorMessage = updateArtist.body.errors;

      expect(errorMessage).toContain('Email cannot be updated');
      expect(errorMessage).toContain('Password cannot be updated');
    });

    it('should return 404 if artist does not exist', async () => {
      const nonExistentId = 'c0ffee-babe-dead-beef-123456789abc';
      const updateArtist = await factory.app.patch(UPDATE_ARTIST_ROUTE(nonExistentId)).send({
        name: 'Ghost Artist'
      });

      expect(updateArtist.status).toBe(404);
      expect(updateArtist.body.message).toBe('Artist does not exist');
    });
  });
});
