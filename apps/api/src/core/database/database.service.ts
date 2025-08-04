import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      await this.connection.db.admin().ping();
      this.logger.log('Successfully connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  /**
   * Get database connection health status
   */
  async getHealthStatus(): Promise<{ status: string; connected: boolean }> {
    try {
      const isConnected = this.connection.readyState === 1;
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        connected: isConnected,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        connected: false,
      };
    }
  }

  /**
   * Get database connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Execute database transaction
   */
  async withTransaction<T>(operation: (session: any) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}