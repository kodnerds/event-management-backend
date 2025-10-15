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
});
