import request from 'supertest';
import app from '../index';
import { prisma, clearDatabase } from './setup';

describe('User Management API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test user and get token for protected routes
    const userData = {
      email: 'testuser@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    token = response.body.token;
    userId = response.body.user.id;
  });

  describe('GET /api/users/profile', () => {
    it('should return the user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'testuser@example.com');
      expect(response.body).toHaveProperty('firstName', 'Test');
      expect(response.body).toHaveProperty('lastName', 'User');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile when authenticated', async () => {
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('firstName', 'Updated');
      expect(response.body).toHaveProperty('lastName', 'Name');
    });

    it('should return 401 when not authenticated', async () => {
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      await request(app)
        .put('/api/users/profile')
        .send(updatedData)
        .expect(401);
    });
  });

  describe('PATCH /api/users/password', () => {
    it('should change user password when authenticated', async () => {
      const passwordData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!'
      };

      await request(app)
        .patch('/api/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(200);

      // Try logging in with the new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should return 401 when not authenticated', async () => {
      const passwordData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!'
      };

      await request(app)
        .patch('/api/users/password')
        .send(passwordData)
        .expect(401);
    });
  });
}); 