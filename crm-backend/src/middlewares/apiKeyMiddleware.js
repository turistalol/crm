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
exports.rateLimitApiKey = exports.authenticateApiKey = void 0;
const apiKeyService_1 = __importDefault(require("../services/apiKeyService"));
const logger_1 = require("../utils/logger");
/**
 * Middleware to authenticate requests using API key
 * Looks for API key in X-API-Key header
 */
const authenticateApiKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'API key is required' });
    }
    try {
        const validApiKey = yield apiKeyService_1.default.validateApiKey(apiKey);
        if (!validApiKey) {
            return res.status(401).json({ message: 'Invalid or inactive API key' });
        }
        // Attach company to request
        req.company = {
            id: validApiKey.companyId,
            name: validApiKey.company.name
        };
        return next();
    }
    catch (error) {
        logger_1.logger.error('Error validating API key:', error);
        return res.status(500).json({ message: 'Error validating API key' });
    }
});
exports.authenticateApiKey = authenticateApiKey;
/**
 * Rate limiting middleware for API requests
 * Simple implementation with in-memory storage
 * For production, consider using Redis-based solution
 */
const apiRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute
const rateLimitApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return next(); // Will be caught by authenticateApiKey
    }
    const now = Date.now();
    if (!apiRequestCounts.has(apiKey)) {
        apiRequestCounts.set(apiKey, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return next();
    }
    const requestData = apiRequestCounts.get(apiKey);
    // Reset count if window has expired
    if (now > requestData.resetTime) {
        requestData.count = 1;
        requestData.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }
    // Check if rate limit exceeded
    if (requestData.count >= RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({
            message: 'Rate limit exceeded',
            retryAfter
        });
    }
    // Increment count
    requestData.count += 1;
    return next();
};
exports.rateLimitApiKey = rateLimitApiKey;
// Cleanup for rate limiting data
// Run every 10 minutes to remove expired entries
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of apiRequestCounts.entries()) {
        if (now > data.resetTime) {
            apiRequestCounts.delete(key);
        }
    }
}, 10 * 60 * 1000);
