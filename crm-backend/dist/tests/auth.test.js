import request from 'supertest';
import app from '../index'; // Updated to use the correct file
import { prisma, clearDatabase } from './setup';

describe('Authentication API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body).toHaveProperty('token');
    });

    it('should return 400 if email is already in use', async () => {
      // Create a user first
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashedPassword',
          firstName: 'Existing',
          lastName: 'User',
        },
      });

      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Another',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      // In a real test, you would hash the password properly
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          password: '$2b$10$abcdefghijklmnopqrstuv', // This would be the hashed version of "password123"
          firstName: 'Login',
          lastName: 'User',
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      // This test is a placeholder - in a real test, you would mock the password verification
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 