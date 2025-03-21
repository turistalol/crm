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
exports.userService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../utils/database"));
const SALT_ROUNDS = 10;
exports.userService = {
    /**
     * Create a new user
     */
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(data.password, SALT_ROUNDS);
            return database_1.default.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role || 'USER',
                    companyId: data.companyId
                }
            });
        });
    },
    /**
     * Find user by email
     */
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.default.user.findUnique({
                where: { email }
            });
        });
    },
    /**
     * Find user by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.default.user.findUnique({
                where: { id }
            });
        });
    },
    /**
     * Update user
     */
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return database_1.default.user.update({
                where: { id },
                data
            });
        });
    },
    /**
     * Verify password
     */
    verifyPassword(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(plainPassword, hashedPassword);
        });
    }
};
