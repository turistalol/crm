"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const setup_1 = require("./setup");
describe('Company Management API', () => {
    let token;
    let userId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, setup_1.clearDatabase)();
        // Create a test user with admin role for testing company endpoints
        const userData = {
            email: 'admin@example.com',
            password: 'Password123!',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN'
        };
        // Register a user
        const userResponse = yield (0, supertest_1.default)(index_1.default)
            .post('/api/auth/register')
            .send(userData);
        token = userResponse.body.token;
        userId = userResponse.body.user.id;
    }));
    describe('POST /api/companies', () => {
        it('should create a new company when authenticated as admin', () => __awaiter(void 0, void 0, void 0, function* () {
            const companyData = {
                name: 'Test Company',
                domain: 'testcompany.com',
                logo: 'https://testcompany.com/logo.png'
            };
            const response = yield (0, supertest_1.default)(index_1.default)
                .post('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .send(companyData)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', 'Test Company');
            expect(response.body).toHaveProperty('domain', 'testcompany.com');
            expect(response.body).toHaveProperty('logo', 'https://testcompany.com/logo.png');
        }));
        it('should return 401 when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const companyData = {
                name: 'Test Company',
                domain: 'testcompany.com'
            };
            yield (0, supertest_1.default)(index_1.default)
                .post('/api/companies')
                .send(companyData)
                .expect(401);
        }));
    });
    describe('GET /api/companies', () => {
        it('should return a list of companies when authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create some test companies first
            yield setup_1.prisma.company.createMany({
                data: [
                    { name: 'Company 1', domain: 'company1.com' },
                    { name: 'Company 2', domain: 'company2.com' }
                ]
            });
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/companies')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).toHaveProperty('companies');
            expect(response.body.companies).toHaveLength(2);
            expect(response.body).toHaveProperty('total', 2);
        }));
        it('should return 401 when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default)
                .get('/api/companies')
                .expect(401);
        }));
    });
    describe('GET /api/companies/:id', () => {
        it('should return a specific company when authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test company
            const company = yield setup_1.prisma.company.create({
                data: {
                    name: 'Specific Company',
                    domain: 'specificcompany.com',
                    logo: 'https://specificcompany.com/logo.png'
                }
            });
            const response = yield (0, supertest_1.default)(index_1.default)
                .get(`/api/companies/${company.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).toHaveProperty('id', company.id);
            expect(response.body).toHaveProperty('name', 'Specific Company');
        }));
        it('should return 404 for non-existent company', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default)
                .get('/api/companies/nonexistentid')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        }));
    });
    describe('PUT /api/companies/:id', () => {
        it('should update a company when authenticated as admin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test company
            const company = yield setup_1.prisma.company.create({
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
            const response = yield (0, supertest_1.default)(index_1.default)
                .put(`/api/companies/${company.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200);
            expect(response.body).toHaveProperty('id', company.id);
            expect(response.body).toHaveProperty('name', 'Updated Company Name');
            expect(response.body).toHaveProperty('domain', 'updatedcompany.com');
        }));
    });
    describe('DELETE /api/companies/:id', () => {
        it('should delete a company when authenticated as admin', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test company
            const company = yield setup_1.prisma.company.create({
                data: {
                    name: 'Company To Delete',
                    domain: 'companytodelete.com'
                }
            });
            yield (0, supertest_1.default)(index_1.default)
                .delete(`/api/companies/${company.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            // Verify company is deleted
            const deletedCompany = yield setup_1.prisma.company.findUnique({
                where: { id: company.id }
            });
            expect(deletedCompany).toBeNull();
        }));
    });
});
