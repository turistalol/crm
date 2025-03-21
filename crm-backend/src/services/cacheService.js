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
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../utils/logger");
// Create a minimal config object since the original import is missing
const config = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || '',
    }
};
class CacheService {
    constructor() {
        this.isConnected = false;
        this.DEFAULT_TTL = 3600; // 1 hour in seconds
        try {
            this.redis = new ioredis_1.default({
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    logger_1.logger.info(`Redis reconnecting attempt ${times} in ${delay}ms`);
                    return delay;
                }
            });
            this.redis.on('connect', () => {
                this.isConnected = true;
                logger_1.logger.info('Connected to Redis server');
            });
            this.redis.on('error', (err) => {
                this.isConnected = false;
                logger_1.logger.error('Redis connection error:', err);
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Redis connection:', error);
            // Fallback to allow application to work without Redis
            this.isConnected = false;
        }
    }
    /**
     * Get a value from cache
     * @param key The cache key
     * @returns The cached value or null if not found
     */
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return null;
            try {
                const value = yield this.redis.get(key);
                if (!value)
                    return null;
                return JSON.parse(value);
            }
            catch (error) {
                logger_1.logger.error(`Error retrieving key ${key} from cache:`, error);
                return null;
            }
        });
    }
    /**
     * Set a value in cache with optional TTL
     * @param key The cache key
     * @param value The value to cache
     * @param ttl Time to live in seconds (optional, defaults to 1 hour)
     */
    set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, ttl = this.DEFAULT_TTL) {
            if (!this.isConnected)
                return;
            try {
                const serialized = JSON.stringify(value);
                yield this.redis.set(key, serialized, 'EX', ttl);
            }
            catch (error) {
                logger_1.logger.error(`Error setting key ${key} in cache:`, error);
            }
        });
    }
    /**
     * Delete a specific key from cache
     * @param key The cache key to delete
     */
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return;
            try {
                yield this.redis.del(key);
            }
            catch (error) {
                logger_1.logger.error(`Error deleting key ${key} from cache:`, error);
            }
        });
    }
    /**
     * Delete all keys matching a pattern
     * @param pattern The pattern to match (e.g., "report:*")
     */
    deleteByPattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return;
            try {
                const keys = yield this.redis.keys(pattern);
                if (keys.length > 0) {
                    yield this.redis.del(...keys);
                    logger_1.logger.info(`Deleted ${keys.length} keys matching pattern ${pattern}`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error deleting keys matching pattern ${pattern}:`, error);
            }
        });
    }
    /**
     * Invalidate cache for a specific entity type and ID
     * @param entityType The entity type (e.g., 'pipeline', 'report')
     * @param entityId The entity ID
     */
    invalidateEntity(entityType, entityId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteByPattern(`${entityType}:${entityId}:*`);
        });
    }
    /**
     * Invalidate cache for a specific company
     * @param companyId The company ID
     */
    invalidateCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteByPattern(`*:company:${companyId}:*`);
        });
    }
    /**
     * Check if the cache service is connected to Redis
     */
    isAvailable() {
        return this.isConnected;
    }
}
// Export a singleton instance
const cacheService = new CacheService();
exports.default = cacheService;
