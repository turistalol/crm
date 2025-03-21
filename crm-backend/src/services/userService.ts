import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../utils/database';

// Define types from the generated Prisma client
type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyId: string | null;
};

type Role = 'ADMIN' | 'MANAGER' | 'USER';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
  companyId?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
  companyId?: string;
}

const SALT_ROUNDS = 10;

export const userService = {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'USER',
        companyId: data.companyId
      }
    });
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  },

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}; 