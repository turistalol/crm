import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Create a minimal config object since the original import is missing
const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  }
};

class CacheService {
  private redis!: Redis;
  private isConnected: boolean = false;
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  constructor() {
    try {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          logger.info(`Redis reconnecting attempt ${times} in ${delay}ms`);
          return delay;
        }
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        logger.info('Connected to Redis server');
      });

      this.redis.on('error', (err) => {
        this.isConnected = false;
        logger.error('Redis connection error:', err);
      });
    } catch (error) {
      logger.error('Failed to initialize Redis connection:', error);
      // Fallback to allow application to work without Redis
      this.isConnected = false;
    }
  }

  /**
   * Get a value from cache
   * @param key The cache key
   * @returns The cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Error retrieving key ${key} from cache:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in seconds (optional, defaults to 1 hour)
   */
  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    if (!this.isConnected) return;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(key, serialized, 'EX', ttl);
    } catch (error) {
      logger.error(`Error setting key ${key} in cache:`, error);
    }
  }

  /**
   * Delete a specific key from cache
   * @param key The cache key to delete
   */
  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error(`Error deleting key ${key} from cache:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern The pattern to match (e.g., "report:*")
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Deleted ${keys.length} keys matching pattern ${pattern}`);
      }
    } catch (error) {
      logger.error(`Error deleting keys matching pattern ${pattern}:`, error);
    }
  }

  /**
   * Invalidate cache for a specific entity type and ID
   * @param entityType The entity type (e.g., 'pipeline', 'report')
   * @param entityId The entity ID
   */
  async invalidateEntity(entityType: string, entityId: string): Promise<void> {
    await this.deleteByPattern(`${entityType}:${entityId}:*`);
  }

  /**
   * Invalidate cache for a specific company
   * @param companyId The company ID
   */
  async invalidateCompany(companyId: string): Promise<void> {
    await this.deleteByPattern(`*:company:${companyId}:*`);
  }

  /**
   * Check if the cache service is connected to Redis
   */
  isAvailable(): boolean {
    return this.isConnected;
  }
}

// Export a singleton instance
const cacheService = new CacheService();
export default cacheService; 