import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists } from '../mocks/data';

const LOGIN_ROUTE = '/auth/login';
const ARTIST_SIGNUP_ROUTE = '/artists/signup';
const USER_SIGNUP_ROUTE = '/users/signup';

const mockUsers = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    role: 'USER'
  }
};

describe('Auth Route', () => {
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

  describe('POST /auth/login - Artist', () => {
    it('should login artist with valid credentials', async () => {
      await factory.app.post(ARTIST_SIGNUP_ROUTE).send(mockArtists.valid);

      const res = await factory.app.post(LOGIN_ROUTE).send({
        email: mockArtists.valid.email,
        password: mockArtists.valid.password
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toMatchObject({
        message: 'Login successfully'
      });
      expect(res.body).toHaveProperty('token');
      expect(res.body.data).toMatchObject({
        id: expect.any(String),
        name: mockArtists.valid.name,
        email: mockArtists.valid.email,
        role: 'ARTIST'
      });
    });

    it('should return 400 for artist with incorrect password', async () => {
      await factory.app.post(ARTIST_SIGNUP_ROUTE).send(mockArtists.valid);

      const res = await factory.app.post(LOGIN_ROUTE).send({
        email: mockArtists.valid.email,
        password: 'WrongPassword@123'
      });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toEqual({
        message: 'Invalid credentials'
      });
    });
  });

  describe('POST /auth/login - User', () => {
    it('should login user with valid credentials', async () => {
      await factory.app.post(USER_SIGNUP_ROUTE).send(mockUsers.valid);

      const res = await factory.app.post(LOGIN_ROUTE).send({
        email: mockUsers.valid.email,
        password: mockUsers.valid.password
      });

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toMatchObject({
        message: 'Login successfully'
      });
      expect(res.body).toHaveProperty('token');
      expect(res.body.data).toMatchObject({
        id: expect.any(String),
        name: `${mockUsers.valid.firstName} ${mockUsers.valid.lastName}`,
        email: mockUsers.valid.email,
        role: 'USER'
      });
    });

    it('should return 400 for user with incorrect password', async () => {
      await factory.app.post(USER_SIGNUP_ROUTE).send(mockUsers.valid);

      const res = await factory.app.post(LOGIN_ROUTE).send({
        email: mockUsers.valid.email,
        password: 'WrongPassword@456'
      });

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toEqual({
        message: 'Invalid credentials'
      });
    });
  });

  describe('POST /auth/login - Common error cases', () => {
    it('should return 404 for non-existent email', async () => {
      const res = await factory.app.post(LOGIN_ROUTE).send({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!'
      });

      expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(res.body).toEqual({
        message: 'Invalid credentials'
      });
    });
  });
});
