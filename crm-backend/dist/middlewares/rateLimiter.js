import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request } from 'express';
import config from '../config/config';
import { logger } from '../utils/logger';

// Setup Redis client for rate limiting if available
let redisClient: Redis | null = null;

try {
  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  });
  
  redisClient.on('error', (err) => {
    logger.error('Redis rate limiter error:', err);
    redisClient = null;
  });
} catch (error) {
  logger.warn('Unable to connect to Redis for rate limiting, using memory store instead:', error);
}

// Configure rate limiter options
const limiterOptions = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    status: 'error',
    message: 'Too many requests, please try again later.'
  },
  // Use Redis store if available, otherwise fall back to memory store
  ...(redisClient ? {
    store: new RedisStore({
      // @ts-expect-error - Type issue with RedisStore configuration
      sendCommand: (...args: string[]) => redisClient!.call(...args),
    }),
  } : {}),
};

// Create different rate limiters for different scenarios
export const standardLimiter = rateLimit({
  ...limiterOptions,
  skip: (req: Request) => {
    // Skip rate limiting for internal API calls
    return req.headers['x-api-internal'] === config.jwt.secret;
  }
});

// More strict limiter for public API endpoints
export const publicApiLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
});

// Stricter limiter for authentication endpoints to prevent brute force
export const authLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per 15 minutes
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later'
  }
});

// Extremely strict limiter for endpoints that should be called infrequently
export const strictLimiter = rateLimit({
  ...limiterOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
}); 