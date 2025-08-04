import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType) {}

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  /**
   * Set a key-value pair with optional expiration
   */
  async set(key: string, value: string | number | object, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redisClient.setEx(key, ttlSeconds, stringValue);
      } else {
        await this.redisClient.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}`, error);
      throw error;
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}`, error);
      throw error;
    }
  }

  /**
   * Get and parse JSON value by key
   */
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get JSON key ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete key(s)
   */
  async del(...keys: string[]): Promise<number> {
    try {
      return await this.redisClient.del(keys);
    } catch (error) {
      this.logger.error(`Failed to delete keys ${keys.join(', ')}`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}`, error);
      throw error;
    }
  }

  /**
   * Set expiration for a key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to set expiration for key ${key}`, error);
      throw error;
    }
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Failed to increment key ${key}`, error);
      throw error;
    }
  }

  /**
   * Add to sorted set (for leaderboards)
   */
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.redisClient.zAdd(key, { score, value: member });
    } catch (error) {
      this.logger.error(`Failed to add to sorted set ${key}`, error);
      throw error;
    }
  }

  /**
   * Get sorted set range (for leaderboards)
   */
  async zrevrange(key: string, start: number, stop: number, withScores = false): Promise<any[]> {
    try {
      if (withScores) {
        return await this.redisClient.zRevRangeWithScores(key, start, stop);
      }
      return await this.redisClient.zRevRange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to get sorted set range ${key}`, error);
      throw error;
    }
  }

  /**
   * Get hash field value
   */
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redisClient.hGet(key, field);
    } catch (error) {
      this.logger.error(`Failed to get hash field ${key}:${field}`, error);
      throw error;
    }
  }

  /**
   * Set hash field value
   */
  async hset(key: string, field: string, value: string | number): Promise<number> {
    try {
      return await this.redisClient.hSet(key, field, value.toString());
    } catch (error) {
      this.logger.error(`Failed to set hash field ${key}:${field}`, error);
      throw error;
    }
  }

  /**
   * Get all hash fields and values
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.redisClient.hGetAll(key);
    } catch (error) {
      this.logger.error(`Failed to get all hash fields ${key}`, error);
      throw error;
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): RedisClientType {
    return this.redisClient;
  }

  /**
   * Health check
   */
  async ping(): Promise<string> {
    try {
      return await this.redisClient.ping();
    } catch (error) {
      this.logger.error('Redis ping failed', error);
      throw error;
    }
  }
}