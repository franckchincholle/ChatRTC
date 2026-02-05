import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Hash un mot de passe avec bcrypt
 * @param password - Mot de passe en clair
 * @returns Hash bcrypt du mot de passe
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

/**
 * Compare un mot de passe en clair avec un hash
 * @param password - Mot de passe en clair
 * @param hash - Hash bcrypt à comparer
 * @returns true si le mot de passe correspond
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};