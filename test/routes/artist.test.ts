import { ArtistRepository } from '../../src/repositories';
import { TestFactory } from '../factory';

const mockArtists = {
  valid: {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'SecurePass123!',
    genre: ['Rock', 'Blues'],
    bio: 'Professional musician with 10 years of experience.'
  },
  validWithoutBio: {
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    password: 'MyPass456@',
    genre: ['Pop', 'Electronic']
  }
};

const SIGNUP_ROUTE = '/artists/signup';
const GET_ARTISTS_ROUTE = '/artists';

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

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: 'Artist created successfully',
        data: { name: mockArtists.valid.name }
      });
      expect(res.body.data).toHaveProperty('id');
    });

    it('should create an artist without optional bio', async () => {
      const res = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.validWithoutBio);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should return 409 when email already exists', async () => {
      await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      const res = await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);

      expect(res.status).toBe(409);
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

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /artists', () => {
    it('should retrieve all artists with limited fields', async () => {
      await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);
      await factory.app.post(SIGNUP_ROUTE).send(mockArtists.validWithoutBio);

      const response = await factory.app.get(GET_ARTISTS_ROUTE);

      expect(response.status).toBe(200);
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
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.message).toBe('Artists retrieved successfully');
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(ArtistRepository.prototype, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(GET_ARTISTS_ROUTE);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal server error');
    });
  });
});
