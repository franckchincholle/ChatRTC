import { hashPassword, comparePassword } from '../../../src/utils/bcrypt';

describe('Bcrypt Utils', () => {
  it('devrait hasher et comparer un mot de passe', async () => {
    const pwd = 'secret_password';
    const hash = await hashPassword(pwd);
    const isMatch = await comparePassword(pwd, hash);
    const isWrong = await comparePassword('wrong', hash);

    expect(isMatch).toBe(true);
    expect(isWrong).toBe(false);
  });
});