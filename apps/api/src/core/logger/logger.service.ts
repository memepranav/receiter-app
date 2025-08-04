import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends Logger {
  private readonly isDevelopment: boolean;
  private readonly logLevel: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.isDevelopment = configService.get('NODE_ENV') === 'development';
    this.logLevel = configService.get('LOG_LEVEL') || 'info';
  }

  /**
   * Log info message with context
   */
  logWithContext(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(message, context);
    super.log(formattedMessage);
  }

  /**
   * Log error with context
   */
  errorWithContext(message: string, trace?: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(message, context);
    super.error(formattedMessage, trace);
  }

  /**
   * Log warning with context
   */
  warnWithContext(message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(message, context);
    super.warn(formattedMessage);
  }

  /**
   * Log debug message with context
   */
  debugWithContext(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage(message, context);
      super.debug(formattedMessage);
    }
  }

  /**
   * Log user activity
   */
  logUserActivity(action: string, userId: string, metadata?: Record<string, any>): void {
    this.logWithContext(`User activity: ${action}`, {
      userId,
      action,
      resource: 'user',
      metadata,
    });
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, path: string, userId?: string, requestId?: string): void {
    this.logWithContext(`API Request: ${method} ${path}`, {
      userId,
      requestId,
      action: 'api_request',
      resource: 'api',
      metadata: { method, path },
    });
  }

  /**
   * Log API response
   */
  logApiResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string,
  ): void {
    this.logWithContext(`API Response: ${method} ${path} - ${statusCode} (${duration}ms)`, {
      userId,
      requestId,
      action: 'api_response',
      resource: 'api',
      metadata: { method, path, statusCode, duration },
    });
  }

  /**
   * Log authentication events
   */
  logAuthEvent(event: string, userId?: string, metadata?: Record<string, any>): void {
    this.logWithContext(`Auth event: ${event}`, {
      userId,
      action: event,
      resource: 'auth',
      metadata,
    });
  }

  /**
   * Log reward events
   */
  logRewardEvent(
    action: string,
    userId: string,
    amount: number,
    metadata?: Record<string, any>,
  ): void {
    this.logWithContext(`Reward event: ${action} - ${amount} points`, {
      userId,
      action,
      resource: 'rewards',
      metadata: { amount, ...metadata },
    });
  }

  /**
   * Log blockchain transactions
   */
  logBlockchainTransaction(
    action: string,
    userId: string,
    transactionHash?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logWithContext(`Blockchain: ${action}`, {
      userId,
      action,
      resource: 'blockchain',
      metadata: { transactionHash, ...metadata },
    });
  }

  /**
   * Log reading session events
   */
  logReadingSession(
    action: string,
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): void {
    this.logWithContext(`Reading session: ${action}`, {
      userId,
      action,
      resource: 'reading_session',
      metadata: { sessionId, ...metadata },
    });
  }

  /**
   * Log database operations
   */
  logDatabaseOperation(
    operation: string,
    collection: string,
    metadata?: Record<string, any>,
  ): void {
    this.debugWithContext(`DB Operation: ${operation} on ${collection}`, {
      action: operation,
      resource: 'database',
      metadata: { collection, ...metadata },
    });
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: string, userId?: string, metadata?: Record<string, any>): void {
    this.warnWithContext(`Security event: ${event}`, {
      userId,
      action: event,
      resource: 'security',
      metadata,
    });
  }

  /**
   * Format message with context
   */
  private formatMessage(message: string, context?: LogContext): string {
    if (!context) return message;

    const contextParts: string[] = [];
    
    if (context.userId) contextParts.push(`userId:${context.userId}`);
    if (context.requestId) contextParts.push(`reqId:${context.requestId}`);
    if (context.action) contextParts.push(`action:${context.action}`);
    if (context.resource) contextParts.push(`resource:${context.resource}`);

    const contextString = contextParts.length > 0 ? `[${contextParts.join(' ')}]` : '';
    const metadataString = context.metadata ? ` ${JSON.stringify(context.metadata)}` : '';

    return `${message} ${contextString}${metadataString}`;
  }

  /**
   * Check if should log based on level
   */
  private shouldLog(level: string): boolean {
    if (this.isDevelopment) return true;

    const levels = ['error', 'warn', 'log', 'debug', 'verbose'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }
}