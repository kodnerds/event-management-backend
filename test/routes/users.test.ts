import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';

const mockUsers = {
  valid: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    role: 'USER'
  },
  validWithOptional: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'AdminPass456@',
    location: 'New York',
    favouriteGenres: ['Rock', 'Jazz']
  }
};

const CREATE_ROUTE = '/users/signup';

describe('Users routes', () => {
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

  describe('GET /users', () => {
    it('should fetch empty record when no record exist', async () => {
      const res = await factory.app.get('/users');

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toHaveLength(0);
    });

    it('should return all users when users exist', async () => {
      await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.validWithOptional);

      const res = await factory.app.get('/users');

      expect(res.status).toBe(HTTP_STATUS.OK);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /users/create', () => {
    it('should create a new user with valid data', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);

      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body).toMatchObject({
        message: 'User created successfully'
      });
      expect(res.body.data).toHaveProperty('id');
    });

    it('should create a user with optional fields', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.validWithOptional);

      expect(res.status).toBe(HTTP_STATUS.CREATED);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should return 409 when email already exists', async () => {
      await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);

      expect(res.status).toBe(HTTP_STATUS.CONFLICT);
      expect(res.body.message).toBe('Email already exists');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        firstName: 'J',
        email: 'invalid-email',
        password: 'weak'
      };
      const res = await factory.app.post(CREATE_ROUTE).send(invalidData);

      expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(res.body).toHaveProperty('errors');
    });
  });
});
