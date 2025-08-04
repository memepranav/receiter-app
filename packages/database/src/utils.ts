/**
 * Database utilities and helpers for the Quran reading app
 */

import { QueryOptions, AggregationPipeline } from './schemas';

// MongoDB Connection Helper
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: any = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(url: string, options?: any): Promise<void> {
    // Connection logic would be implemented here
    console.log(`Connecting to database: ${url}`);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection !== null;
  }
}

// Query Builder Utilities
export class QueryBuilder {
  private filters: Record<string, any> = {};
  private sortOptions: Record<string, 1 | -1> = {};
  private limitValue?: number;
  private skipValue?: number;
  private selectFields?: Record<string, 1 | 0>;

  where(field: string, value: any): QueryBuilder {
    this.filters[field] = value;
    return this;
  }

  whereIn(field: string, values: any[]): QueryBuilder {
    this.filters[field] = { $in: values };
    return this;
  }

  whereNotIn(field: string, values: any[]): QueryBuilder {
    this.filters[field] = { $nin: values };
    return this;
  }

  whereGte(field: string, value: any): QueryBuilder {
    this.filters[field] = { ...this.filters[field], $gte: value };
    return this;
  }

  whereLte(field: string, value: any): QueryBuilder {
    this.filters[field] = { ...this.filters[field], $lte: value };
    return this;
  }

  whereBetween(field: string, min: any, max: any): QueryBuilder {
    this.filters[field] = { $gte: min, $lte: max };
    return this;
  }

  whereExists(field: string, exists: boolean = true): QueryBuilder {
    this.filters[field] = { $exists: exists };
    return this;
  }

  whereRegex(field: string, pattern: string | RegExp, options?: string): QueryBuilder {
    this.filters[field] = { $regex: pattern, $options: options };
    return this;
  }

  sort(field: string, direction: 'asc' | 'desc' = 'asc'): QueryBuilder {
    this.sortOptions[field] = direction === 'asc' ? 1 : -1;
    return this;
  }

  limit(limit: number): QueryBuilder {
    this.limitValue = limit;
    return this;
  }

  skip(skip: number): QueryBuilder {
    this.skipValue = skip;
    return this;
  }

  select(fields: string[] | Record<string, 1 | 0>): QueryBuilder {
    if (Array.isArray(fields)) {
      this.selectFields = fields.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
      }, {} as Record<string, 1>);
    } else {
      this.selectFields = fields;
    }
    return this;
  }

  build(): { filter: Record<string, any>; options: QueryOptions } {
    const options: QueryOptions = {};

    if (Object.keys(this.sortOptions).length > 0) {
      options.sort = this.sortOptions;
    }

    if (this.limitValue) {
      options.limit = this.limitValue;
    }

    if (this.skipValue) {
      options.skip = this.skipValue;
    }

    if (this.selectFields) {
      options.select = this.selectFields;
    }

    return {
      filter: this.filters,
      options
    };
  }

  reset(): QueryBuilder {
    this.filters = {};
    this.sortOptions = {};
    this.limitValue = undefined;
    this.skipValue = undefined;
    this.selectFields = undefined;
    return this;
  }
}

// Aggregation Pipeline Builder
export class AggregationBuilder {
  private pipeline: AggregationPipeline[] = [];

  match(conditions: Record<string, any>): AggregationBuilder {
    this.pipeline.push({ $match: conditions });
    return this;
  }

  group(groupBy: Record<string, any>): AggregationBuilder {
    this.pipeline.push({ $group: groupBy });
    return this;
  }

  sort(sortBy: Record<string, number>): AggregationBuilder {
    this.pipeline.push({ $sort: sortBy });
    return this;
  }

  limit(limit: number): AggregationBuilder {
    this.pipeline.push({ $limit: limit });
    return this;
  }

  skip(skip: number): AggregationBuilder {
    this.pipeline.push({ $skip: skip });
    return this;
  }

  project(projection: Record<string, any>): AggregationBuilder {
    this.pipeline.push({ $project: projection });
    return this;
  }

  lookup(from: string, localField: string, foreignField: string, as: string): AggregationBuilder {
    this.pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        as
      }
    });
    return this;
  }

  unwind(path: string, preserveNullAndEmptyArrays: boolean = false): AggregationBuilder {
    this.pipeline.push({
      $unwind: {
        path,
        preserveNullAndEmptyArrays
      }
    });
    return this;
  }

  addFields(fields: Record<string, any>): AggregationBuilder {
    this.pipeline.push({ $addFields: fields });
    return this;
  }

  build(): AggregationPipeline[] {
    return this.pipeline;
  }

  reset(): AggregationBuilder {
    this.pipeline = [];
    return this;
  }
}

// Pagination Utilities
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    current: number;
    pages: number;
    count: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginationHelper {
  static getSkipAndLimit(page: number, limit: number): { skip: number; limit: number } {
    const skip = (page - 1) * limit;
    return { skip, limit };
  }

  static buildPaginationResult<T>(
    data: T[],
    totalCount: number,
    page: number,
    limit: number
  ): PaginationResult<T> {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      pagination: {
        current: page,
        pages: totalPages,
        count: totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

// Validation Utilities
export class ValidationHelper {
  static isValidObjectId(id: string): boolean {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeString(str: string): string {
    return str.replace(/[<>]/g, '').trim();
  }

  static validateRequiredFields(obj: Record<string, any>, requiredFields: string[]): string[] {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
        missingFields.push(field);
      }
    }

    return missingFields;
  }
}

// Index Management
export class IndexManager {
  static readonly USER_INDEXES = [
    { key: { email: 1 }, unique: true },
    { key: { username: 1 }, unique: true },
    { key: { walletAddress: 1 }, sparse: true },
    { key: { createdAt: -1 } },
    { key: { isActive: 1, emailVerified: 1 } }
  ];

  static readonly READING_SESSION_INDEXES = [
    { key: { userId: 1, createdAt: -1 } },
    { key: { userId: 1, completed: 1 } },
    { key: { startTime: -1 } },
    { key: { 'surahsRead.surahNumber': 1 } }
  ];

  static readonly BOOKMARK_INDEXES = [
    { key: { userId: 1, createdAt: -1 } },
    { key: { userId: 1, surahNumber: 1, ayahNumber: 1 }, unique: true },
    { key: { tags: 1 } }
  ];

  static readonly REWARD_INDEXES = [
    { key: { userId: 1, createdAt: -1 } },
    { key: { userId: 1, status: 1 } },
    { key: { type: 1, status: 1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
  ];

  static readonly TRANSACTION_INDEXES = [
    { key: { userId: 1, createdAt: -1 } },
    { key: { userId: 1, type: 1, status: 1 } },
    { key: { blockchainTxHash: 1 }, sparse: true },
    { key: { status: 1, createdAt: -1 } }
  ];

  static readonly ANALYTICS_EVENT_INDEXES = [
    { key: { userId: 1, timestamp: -1 } },
    { key: { eventType: 1, eventName: 1, timestamp: -1 } },
    { key: { timestamp: -1 } },
    { key: { sessionId: 1 }, sparse: true }
  ];

  static readonly NOTIFICATION_INDEXES = [
    { key: { userId: 1, createdAt: -1 } },
    { key: { userId: 1, isRead: 1 } },
    { key: { type: 1, createdAt: -1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
  ];
}

// Caching Utilities
export class CacheHelper {
  private static cache = new Map<string, { data: any; expires: number }>();

  static set(key: string, data: any, ttlSeconds: number = 300): void {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expires });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expires) {
        this.cache.delete(key);
      }
    }
  }

  static generateKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}

// Database Migration Utilities
export class MigrationHelper {
  static async runMigration(
    migrationName: string,
    migrationFunction: () => Promise<void>
  ): Promise<void> {
    console.log(`Running migration: ${migrationName}`);
    
    try {
      await migrationFunction();
      console.log(`Migration completed: ${migrationName}`);
    } catch (error) {
      console.error(`Migration failed: ${migrationName}`, error);
      throw error;
    }
  }

  static async createBackup(collectionName: string): Promise<void> {
    const backupName = `${collectionName}_backup_${Date.now()}`;
    console.log(`Creating backup: ${backupName}`);
    // Backup logic would be implemented here
  }

  static async restoreBackup(backupName: string): Promise<void> {
    console.log(`Restoring backup: ${backupName}`);
    // Restore logic would be implemented here
  }
}

// Performance Monitoring
export class PerformanceMonitor {
  private static queries: Array<{
    collection: string;
    operation: string;
    duration: number;
    timestamp: Date;
  }> = [];

  static startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }

  static logQuery(collection: string, operation: string, duration: number): void {
    this.queries.push({
      collection,
      operation,
      duration,
      timestamp: new Date()
    });

    // Keep only last 1000 queries
    if (this.queries.length > 1000) {
      this.queries.shift();
    }

    // Log slow queries (> 1000ms)
    if (duration > 1000) {
      console.warn(`Slow query detected: ${collection}.${operation} took ${duration}ms`);
    }
  }

  static getStats(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: number;
    queryBreakdown: Record<string, number>;
  } {
    const totalQueries = this.queries.length;
    const totalDuration = this.queries.reduce((sum, query) => sum + query.duration, 0);
    const averageDuration = totalQueries > 0 ? totalDuration / totalQueries : 0;
    const slowQueries = this.queries.filter(query => query.duration > 1000).length;

    const queryBreakdown = this.queries.reduce((breakdown, query) => {
      const key = `${query.collection}.${query.operation}`;
      breakdown[key] = (breakdown[key] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    return {
      totalQueries,
      averageDuration,
      slowQueries,
      queryBreakdown
    };
  }

  static reset(): void {
    this.queries = [];
  }
}

// Transaction Utilities (for operations that need to be atomic)
export class TransactionHelper {
  static async withTransaction<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // Transaction logic would be implemented here
    // This is a placeholder for MongoDB transactions
    console.log('Starting transaction');
    
    try {
      const result = await operation();
      console.log('Transaction committed');
      return result;
    } catch (error) {
      console.log('Transaction aborted');
      throw error;
    }
  }
}

// Export all utilities
