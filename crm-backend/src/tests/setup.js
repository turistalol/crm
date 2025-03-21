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
exports.prisma = void 0;
exports.clearDatabase = clearDatabase;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config({ path: '.env.test' });
// Create a global Prisma client for tests
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
// Cleanup function to be used after tests
function clearDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete all data in reverse order of dependencies
        yield prisma.refreshToken.deleteMany({});
        yield prisma.user.deleteMany({});
        yield prisma.company.deleteMany({});
    });
}
// Setup before all tests
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Any setup needed before tests run
}));
// Cleanup after all tests
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield clearDatabase();
    yield prisma.$disconnect();
}));
