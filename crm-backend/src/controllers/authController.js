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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const logger_1 = require("../utils/logger");
const authService_1 = require("../services/authService");
const userService_1 = require("../services/userService");
/**
 * Register a new user
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, companyId } = req.body;
        // Check if user already exists
        const existingUser = yield userService_1.userService.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        // Create user
        const user = yield userService_1.userService.createUser({
            email,
            password,
            firstName,
            lastName,
            companyId
        });
        // Generate tokens
        const { accessToken, refreshToken } = yield authService_1.authService.generateTokens(user.id, user.email, user.role);
        // Return user and tokens
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        logger_1.logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});
exports.register = register;
/**
 * Login user
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Authenticate user using login method
        const tokens = yield authService_1.authService.login(email, password);
        if (!tokens) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Get user details
        const user = yield userService_1.userService.findByEmail(email);
        // Return user and tokens
        res.status(200).json(Object.assign({ message: 'Login successful', user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            } }, tokens));
    }
    catch (error) {
        logger_1.logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});
exports.login = login;
/**
 * Refresh access token
 */
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        // Validate refresh token and get new tokens
        const tokens = yield authService_1.authService.refreshToken(refreshToken);
        if (!tokens) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        // Return new tokens
        res.status(200).json(Object.assign({ message: 'Token refreshed successfully' }, tokens));
    }
    catch (error) {
        logger_1.logger.error(`Token refresh error: ${error.message}`);
        res.status(500).json({ message: 'Error refreshing token', error: error.message });
    }
});
exports.refreshToken = refreshToken;
/**
 * Logout user
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        // Invalidate refresh token
        const success = yield authService_1.authService.logout(refreshToken);
        if (success) {
            res.status(200).json({ message: 'Logged out successfully' });
        }
        else {
            res.status(400).json({ message: 'Invalid refresh token' });
        }
    }
    catch (error) {
        logger_1.logger.error(`Logout error: ${error.message}`);
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
});
exports.logout = logout;
