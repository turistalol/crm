"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = (req, res, next) => {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided' });
    }
    // Check if format is Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token format should be: Bearer <token>' });
    }
    const token = parts[1];
    try {
        if (!process.env.JWT_SECRET) {
            logger_1.logger.error('JWT_SECRET is not defined');
            return res.status(500).json({ message: 'Internal server error' });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach user data to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        return next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        logger_1.logger.error(`Auth error: ${error}`);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to check if user has specified role
 */
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        return next();
    };
};
exports.authorize = authorize;
