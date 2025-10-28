import { ArtistRepository } from '../../src/repositories';
import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockShows } from '../mocks/data';
import { generateTestAuthToken } from '../mocks/utils';

import type { ArtistEntity } from '../../src/entities';
import type { AuthenticatedUser } from '../../src/types';

const CREATE_SHOW_ROUTE = '/shows/create';

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
      const token = generateTestAuthToken(artistUser);
      jest.spyOn(ArtistRepository.prototype, 'findOne').mockResolvedValue({
        id: artistUser.id,
        name: artistUser.name,
        email: artistUser.email,
        genre: ['Afrobeats'],
        bio: 'Mock bio'
      } as ArtistEntity);

      const response = await factory.app
        .post(CREATE_SHOW_ROUTE)
        .set('Authorization', `Bearer ${token}`)
        .send(mockShows.valid);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toMatchObject({
        message: 'Show created successfully',
        data: {
          title: mockShows.valid.title,
          artistId: artistUser.id,
          date: mockShows.valid.date
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
      //expect(response.body).toHaveProperty('errors')
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
