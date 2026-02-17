import { prisma } from '../config/database';
import { User } from '@prisma/client';

export interface CreateUserData {
  username: string;
  email: string;
  password: string; 
}

export class UserRepository {

  async createUser(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}

export const userRepository = new UserRepository();