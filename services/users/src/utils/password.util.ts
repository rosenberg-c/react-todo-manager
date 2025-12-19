import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function comparePassword(
  plainTextPassword: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hash);
}
