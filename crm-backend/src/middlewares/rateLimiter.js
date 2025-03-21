"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strictLimiter = exports.authLimiter = exports.publicApiLimiter = exports.standardLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = require("../utils/logger");
// Setup Redis client for rate limiting if available
let redisClient = null;
try {
    redisClient = new ioredis_1.default({
        host: config_1.default.redis.host,
        port: config_1.default.redis.port,
        password: config_1.default.redis.password,
    });
    redisClient.on('error', (err) => {
        logger_1.logger.error('Redis rate limiter error:', err);
        redisClient = null;
    });
}
catch (error) {
    logger_1.logger.warn('Unable to connect to Redis for rate limiting, using memory store instead:', error);
}
// Configure rate limiter options
const limiterOptions = Object.assign({ windowMs: config_1.default.rateLimit.windowMs, max: config_1.default.rateLimit.max, standardHeaders: true, legacyHeaders: false, message: {
        status: 'error',
        message: 'Too many requests, please try again later.'
    } }, (redisClient ? {
    store: new rate_limit_redis_1.default({
        // @ts-expect-error - Type issue with RedisStore configuration
        sendCommand: (...args) => redisClient.call(...args),
    }),
} : {}));
// Create different rate limiters for different scenarios
exports.standardLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, limiterOptions), { skip: (req) => {
        // Skip rate limiting for internal API calls
        return req.headers['x-api-internal'] === config_1.default.jwt.secret;
    } }));
// More strict limiter for public API endpoints
exports.publicApiLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, limiterOptions), { windowMs: 60 * 1000, max: 30 }));
// Stricter limiter for authentication endpoints to prevent brute force
exports.authLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, limiterOptions), { windowMs: 15 * 60 * 1000, max: 10, message: {
        status: 'error',
        message: 'Too many login attempts, please try again later'
    } }));
// Extremely strict limiter for endpoints that should be called infrequently
exports.strictLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, limiterOptions), { windowMs: 60 * 60 * 1000, max: 5 }));
