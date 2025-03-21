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
const index_1 = __importDefault(require("../index")); // Updated to use the correct file
const setup_1 = require("./setup");
describe('Authentication API', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, setup_1.clearDatabase)();
    }));
    describe('POST /api/auth/register', () => {
        it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User',
            };
            const response = yield (0, supertest_1.default)(index_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user).not.toHaveProperty('password');
            expect(response.body).toHaveProperty('token');
        }));
        it('should return 400 if email is already in use', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a user first
            yield setup_1.prisma.user.create({
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
            const response = yield (0, supertest_1.default)(index_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/login', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test user for login tests
            // In a real test, you would hash the password properly
            yield setup_1.prisma.user.create({
                data: {
                    email: 'login@example.com',
                    password: '$2b$10$abcdefghijklmnopqrstuv', // This would be the hashed version of "password123"
                    firstName: 'Login',
                    lastName: 'User',
                },
            });
        }));
        it('should login successfully with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            // This test is a placeholder - in a real test, you would mock the password verification
            const response = yield (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'password123',
            })
                .expect(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('refreshToken');
        }));
        it('should return 401 with invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'wrongpassword',
            })
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
});
