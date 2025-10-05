import { hashPassword } from '';

describe('UserService - Unit', () => {
  it('should hash a password', async () => {
    const hashed = await hashPassword('mypassword');
    expect(hashed).not.toEqual('mypassword');
  });
});
