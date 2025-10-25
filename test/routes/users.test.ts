import { UserRepository } from '../../src/repositories';
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
  },
  adminValidData: {
    firstName: 'John',
    lastName: 'Mitchel',
    email: 'john.itchel@example.com',
    password: 'SecureAdminPass123!',
    role: 'ADMIN'
  }
};

const CREATE_ROUTE = '/users/signup';
const GET_USERS_ROUTE = '/users';

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
    it('should retrieve all users with limited fields', async () => {
      await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.validWithOptional);

      const response = await factory.app.get(GET_USERS_ROUTE);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);

      const firstUser = response.body.data[0];

      // Verify expected fields exist
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('firstName');
      expect(firstUser).toHaveProperty('lastName');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('favouriteGenres');
      expect(firstUser).toHaveProperty('location');

      // Verify password is excluded
      expect(firstUser).not.toHaveProperty('password');
    });

    it('should return empty array when no users exist', async () => {
      const response = await factory.app.get(GET_USERS_ROUTE);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      expect(response.body.message).toBe('Users retrieved successfully');
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(UserRepository.prototype, 'findAll')
        .mockRejectedValueOnce(new Error('Database error'));

      const response = await factory.app.get(GET_USERS_ROUTE);
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('message', 'Internal server error');
    });

    it('should support pagination with page and limit parameters', async () => {
      // Create 3 users
      await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.validWithOptional);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.adminValidData);

      const response = await factory.app.get(GET_USERS_ROUTE).query({ page: 1, limit: 2 });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        limit: 2,
        total: 3,
        totalPages: 2
      });
    });

    it('should return second page when page parameter is provided', async () => {
      // Create 3 users
      await factory.app.post(CREATE_ROUTE).send(mockUsers.valid);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.validWithOptional);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.adminValidData);

      const response = await factory.app.get(GET_USERS_ROUTE).query({ page: 2, limit: 2 });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        currentPage: 2,
        limit: 2,
        total: 3,
        totalPages: 2
      });
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
