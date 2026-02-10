import { prisma } from '../config/database';
import { User } from '@prisma/client';

/**
 * Type pour créer un nouvel utilisateur
 */
export interface CreateUserData {
  username: string;
  email: string;
  password: string; // Déjà hashé avant d'arriver ici !
}

/**
 * Repository pour les opérations sur les users
 */
export class UserRepository {
  /**
   * Créer un nouvel utilisateur
   */
  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
  }

  /**
   * Trouver un user par email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Trouver un user par username
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Trouver un user par ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Vérifier si un email existe déjà
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Vérifier si un username existe déjà
   */
  async usernameExists(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}

// Export d'une instance singleton
export const userRepository = new UserRepository();