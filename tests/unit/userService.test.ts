import { hashPassword,comparePassword } from '../../src/utils/hash';

describe('UserService - Unit', () => {
  it('should hash a password', async () => {
    const hashed = await hashPassword('mypassword');
    expect(hashed).not.toEqual('mypassword');
  });

  it("should validate correct password with comparePassword", async () => {
    const plain = "mypassword123";
    const hashed = await hashPassword(plain);

    const isMatch = await comparePassword(plain, hashed);
    expect(isMatch).toBe(true);
  });

  it("should reject wrong password with comparePassword", async () => {
    const plain = "mypassword123";
    const hashed = await hashPassword(plain);

    const isMatch = await comparePassword("wrongpassword", hashed);
    expect(isMatch).toBe(false);
  });
});
