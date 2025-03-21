import request from 'supertest';
import app from '../index';
import { prisma, clearDatabase } from './setup';

describe('Company Management API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await clearDatabase();
    
    // Create a test user with admin role for testing company endpoints
    const userData = {
      email: 'admin@example.com',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    };

    // Register a user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    token = userResponse.body.token;
    userId = userResponse.body.user.id;
  });

  describe('POST /api/companies', () => {
    it('should create a new company when authenticated as admin', async () => {
      const companyData = {
        name: 'Test Company',
        domain: 'testcompany.com',
        logo: 'https://testcompany.com/logo.png'
      };

      const response = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send(companyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Test Company');
      expect(response.body).toHaveProperty('domain', 'testcompany.com');
      expect(response.body).toHaveProperty('logo', 'https://testcompany.com/logo.png');
    });

    it('should return 401 when not authenticated', async () => {
      const companyData = {
        name: 'Test Company',
        domain: 'testcompany.com'
      };

      await request(app)
        .post('/api/companies')
        .send(companyData)
        .expect(401);
    });
  });

  describe('GET /api/companies', () => {
    it('should return a list of companies when authenticated', async () => {
      // Create some test companies first
      await prisma.company.createMany({
        data: [
          { name: 'Company 1', domain: 'company1.com' },
          { name: 'Company 2', domain: 'company2.com' }
        ]
      });

      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('companies');
      expect(response.body.companies).toHaveLength(2);
      expect(response.body).toHaveProperty('total', 2);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/companies')
        .expect(401);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return a specific company when authenticated', async () => {
      // Create a test company
      const company = await prisma.company.create({
        data: {
          name: 'Specific Company',
          domain: 'specificcompany.com',
          logo: 'https://specificcompany.com/logo.png'
        }
      });

      const response = await request(app)
        .get(`/api/companies/${company.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', company.id);
      expect(response.body).toHaveProperty('name', 'Specific Company');
    });

    it('should return 404 for non-existent company', async () => {
      await request(app)
        .get('/api/companies/nonexistentid')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update a company when authenticated as admin', async () => {
      // Create a test company
      const company = await prisma.company.create({
        data: {
          name: 'Company To Update',
          domain: 'companytoupdate.com'
        }
      });

      const updateData = {
        name: 'Updated Company Name',
        domain: 'updatedcompany.com',
        logo: 'https://updatedcompany.com/logo.png'
      };

      const response = await request(app)
        .put(`/api/companies/${company.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', company.id);
      expect(response.body).toHaveProperty('name', 'Updated Company Name');
      expect(response.body).toHaveProperty('domain', 'updatedcompany.com');
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete a company when authenticated as admin', async () => {
      // Create a test company
      const company = await prisma.company.create({
        data: {
          name: 'Company To Delete',
          domain: 'companytodelete.com'
        }
      });

      await request(app)
        .delete(`/api/companies/${company.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify company is deleted
      const deletedCompany = await prisma.company.findUnique({
        where: { id: company.id }
      });
      
      expect(deletedCompany).toBeNull();
    });
  });
}); 