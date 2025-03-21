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
describe('User Management API', () => {
    let token;
    let userId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, setup_1.clearDatabase)();
        // Create a test user and get token for protected routes
        const userData = {
            email: 'testuser@example.com',
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'User',
        };
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/api/auth/register')
            .send(userData);
        token = response.body.token;
        userId = response.body.user.id;
    }));
    describe('GET /api/users/profile', () => {
        it('should return the user profile when authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('email', 'testuser@example.com');
            expect(response.body).toHaveProperty('firstName', 'Test');
            expect(response.body).toHaveProperty('lastName', 'User');
            expect(response.body).not.toHaveProperty('password');
        }));
        it('should return 401 when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default)
                .get('/api/users/profile')
                .expect(401);
        }));
    });
    describe('PUT /api/users/profile', () => {
        it('should update user profile when authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedData = {
                firstName: 'Updated',
                lastName: 'Name'
            };
            const response = yield (0, supertest_1.default)(index_1.default)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send(updatedData)
                .expect(200);
            expect(response.body).toHaveProperty('firstName', 'Updated');
            expect(response.body).toHaveProperty('lastName', 'Name');
        }));
        it('should return 401 when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedData = {
                firstName: 'Updated',
                lastName: 'Name'
            };
            yield (0, supertest_1.default)(index_1.default)
                .put('/api/users/profile')
                .send(updatedData)
                .expect(401);
        }));
    });
    describe('PATCH /api/users/password', () => {
        it('should change user password when authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const passwordData = {
                currentPassword: 'Password123!',
                newPassword: 'NewPassword123!'
            };
            yield (0, supertest_1.default)(index_1.default)
                .patch('/api/users/password')
                .set('Authorization', `Bearer ${token}`)
                .send(passwordData)
                .expect(200);
            // Try logging in with the new password
            const loginResponse = yield (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: 'testuser@example.com',
                password: 'NewPassword123!'
            })
                .expect(200);
            expect(loginResponse.body).toHaveProperty('token');
        }));
        it('should return 401 when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const passwordData = {
                currentPassword: 'Password123!',
                newPassword: 'NewPassword123!'
            };
            yield (0, supertest_1.default)(index_1.default)
                .patch('/api/users/password')
                .send(passwordData)
                .expect(401);
        }));
    });
});
