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
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../utils/database"));
const userService_1 = require("./userService");
// Token options
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
exports.authService = {
    /**
     * Generate JWT tokens for a user
     */
    generateTokens(userId, email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
            }
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error('REFRESH_TOKEN_SECRET is not defined');
            }
            const tokenPayload = {
                userId,
                email,
                role
            };
            // Generate access token
            const accessToken = jsonwebtoken_1.default.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
            // Generate refresh token
            const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
            // Calculate expiry date for database
            const refreshExpiry = new Date();
            refreshExpiry.setDate(refreshExpiry.getDate() + 7); // 7 days
            // Store refresh token in database
            yield database_1.default.refreshToken.create({
                data: {
                    token: refreshToken,
                    expiresAt: refreshExpiry,
                    userId
                }
            });
            return {
                accessToken,
                refreshToken
            };
        });
    },
    /**
     * Verify a refresh token and generate new tokens
     */
    refreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error('REFRESH_TOKEN_SECRET is not defined');
            }
            try {
                // Find token in database
                const storedToken = yield database_1.default.refreshToken.findUnique({
                    where: { token },
                    include: { user: true }
                });
                // Check if token exists and is not expired
                if (!storedToken || storedToken.expiresAt < new Date()) {
                    return null;
                }
                // Verify token signature
                const payload = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
                // Delete used refresh token
                yield database_1.default.refreshToken.delete({
                    where: { id: storedToken.id }
                });
                // Generate new tokens
                return this.generateTokens(payload.userId, payload.email, payload.role);
            }
            catch (error) {
                return null;
            }
        });
    },
    /**
     * Validate user credentials and generate tokens
     */
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user by email
            const user = yield userService_1.userService.findByEmail(email);
            if (!user)
                return null;
            // Verify password
            const isPasswordValid = yield userService_1.userService.verifyPassword(password, user.password);
            if (!isPasswordValid)
                return null;
            // Generate and return tokens
            return this.generateTokens(user.id, user.email, user.role);
        });
    },
    /**
     * Invalidate a refresh token
     */
    logout(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Delete refresh token from database
                yield database_1.default.refreshToken.deleteMany({
                    where: { token }
                });
                return true;
            }
            catch (error) {
                return false;
            }
        });
    }
};
