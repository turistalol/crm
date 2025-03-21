import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Create a global Prisma client for tests
const prisma = new PrismaClient();

// Cleanup function to be used after tests
async function clearDatabase() {
  // Delete all data in reverse order of dependencies
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});
}

// Setup before all tests
beforeAll(async () => {
  // Any setup needed before tests run
});

// Cleanup after all tests
afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

export { prisma, clearDatabase }; 