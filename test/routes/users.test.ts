import { UserRole } from '../../src/entities';
import { TestFactory } from '../factory';

const mockUsers = {
  alice: {
    firstName: 'Alice',
    lastName: 'Ruso',
    email: "alice@example.com",
    role: "ADMIN"
  },
  clown: {
    firstName: 'Clown',
    lastName: 'Rousey',
    email: "clown@example.com",
    password: "strongpass",
    role: "USER"
  },
  jim: {
    firstName: 'Jim',
    lastName: 'Carrey',
    email: "jim@example.com",
    password: "strongpass",
    role: "USER"
  },
  mmawu:{
    lastname:"arinze"
  },
  ali: {
    firstName: 'Alice',
    lastName: 'Ruso',
    email: "invalid-email",
    password: "strongpass",
    role: "ADMIN"
  },
  short: {
    firstName: 'Alice',
    lastName: 'Ruso',
    email: "alice@example.com",
    password: "st",
    role: "USER"
  },
  cane: {
    firstName: 'Existing',
    lastName: 'User',
    email: "duplicate@example.com",
    password: "hashedpassword",
    role: "USER"
  },
};

const CREATE_ROUTE = '/users/signup';

// eslint-disable-next-line max-lines-per-function
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
  });

  describe('POST /users', () => {
    it('should create a new user with user role', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.jim);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: 'User created successfully',
        data: mockUsers.jim
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.role).toBe(UserRole.USER)
    });

     it('should create a new user with ADMIN role', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.alice);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: 'User created successfully',
        data: mockUsers.alice
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.role).toBe(UserRole.ADMIN)
    });

    it('should return 400 if required field are missing', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.mmawu);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Validation error')
    });

    it('should return 400 if email is invalid', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.ali);

      expect(res.status).toBe(400);
      expect(res.body.details[0]).toContain('Invalid email format');
    });

    it('should return 400 if password is too short', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.short);

      expect(res.status).toBe(400);
      expect(res.body.details[0]).toContain('Password must be at least 6 characters');
    });

    it('should return 409 if email already exists', async () => {
      const res = await factory.app.post(CREATE_ROUTE).send(mockUsers.cane);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Email already exists');
  });

    it('should create multiple users independently', async () => {
      await factory.app.post(CREATE_ROUTE).send(mockUsers.alice);
      await factory.app.post(CREATE_ROUTE).send(mockUsers.clown);

      const res = await factory.app.get('/users');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });
});
