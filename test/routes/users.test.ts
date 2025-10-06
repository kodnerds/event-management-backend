import { TestFactory } from '../factory';

const mockUsers = {
  john: {
    firstName: 'John',
    lastName: 'Doe',
    age: 30
  },
  jane: {
    firstName: 'Jane',
    lastName: 'Smith',
    age: 25
  }
};

const CREATE_ROUTE = '/users/create';

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

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('should return all users when users exist', async () => {
      await factory.app.post(CREATE_ROUTE).send(mockUsers.john);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.jane);

      const res = await factory.app.get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject(mockUsers.john);
      expect(res.body[1]).toMatchObject(mockUsers.jane);
    });
  });

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.john);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: 'User created successfully',
        data: mockUsers.john
      });
      expect(res.body.data).toHaveProperty('id');
    });

    it('should create multiple users independently', async () => {
      await factory.app.post(CREATE_ROUTE).send(mockUsers.jane);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.jane);

      const res = await factory.app.get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });
});
