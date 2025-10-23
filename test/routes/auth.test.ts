import { HTTP_STATUS } from '../../src/utils/const';
import { TestFactory } from '../factory';
import { mockArtists } from '../mocks/data';

const LOGIN_ROUTE = '/auth/login';
const SIGNUP_ROUTE = '/artists/signup';

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

  it('should login artist with valid data', async () => {
    await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);

    const res = await factory.app.post(LOGIN_ROUTE).send({
      email: mockArtists.valid.email,
      password: mockArtists.valid.password
    });

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body).toMatchObject({
      message: 'Login successfully'
    });
    expect(res.body).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('role');
  });

  it('should return 404 for invalid email', async () => {
    const res = await factory.app.post(LOGIN_ROUTE).send({
      email: 'invalidemail@example.com',
      password: mockArtists.valid.password
    });

    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(res.body).toMatchObject({
      message: 'Invalid credentials'
    });
    expect(res.body).toHaveProperty('message');
  });

  it('should return 401 for incorrect password', async () => {
    await factory.app.post(SIGNUP_ROUTE).send(mockArtists.valid);

    const res = await factory.app.post(LOGIN_ROUTE).send({
      email: mockArtists.valid.email,
      password: 'validPassword@419'
    });

    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(res.body).toMatchObject({
      message: 'Invalid credentials'
    });
    expect(res.body).toHaveProperty('message');
  });
});
