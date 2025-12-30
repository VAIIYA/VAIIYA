/**
 * Logging utility for MemeHaus application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    let formatted = `[${timestamp}] ${levelName}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`;
      if (this.isDevelopment) {
        formatted += ` | Stack: ${error.stack}`;
      }
    }
    
    return formatted;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, context, error);
    
    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }

    // In production, you might want to send logs to a service
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      this.sendToExternalService(level, message, context, error);
    }
  }

  private async sendToExternalService(
    level: LogLevel, 
    message: string, 
    context?: Record<string, any>, 
    error?: Error
  ): Promise<void> {
    // Example: Send to external logging service
    try {
      // This would be your actual logging service integration
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ level, message, context, error: error?.message })
      // });
    } catch (e) {
      console.error('Failed to send log to external service:', e);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Specialized logging methods
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, { ...context, type: 'user_action' });
  }

  apiCall(method: string, url: string, status?: number, duration?: number): void {
    this.info(`API call: ${method} ${url}`, { 
      method, 
      url, 
      status, 
      duration,
      type: 'api_call' 
    });
  }

  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation}`, { 
      operation, 
      duration, 
      type: 'performance',
      ...context 
    });
  }

  security(event: string, context?: Record<string, any>): void {
    this.warn(`Security event: ${event}`, { ...context, type: 'security' });
  }

  business(event: string, context?: Record<string, any>): void {
    this.info(`Business event: ${event}`, { ...context, type: 'business' });
  }
}

// Create singleton instance
export const logger = new Logger();

// Performance monitoring
export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();

  start(operation: string): void {
    this.timers.set(operation, performance.now());
  }

  end(operation: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`Performance timer not found for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(operation);
    
    logger.performance(operation, duration, context);
    return duration;
  }

  measure<T>(operation: string, fn: () => T, context?: Record<string, any>): T {
    this.start(operation);
    try {
      const result = fn();
      this.end(operation, context);
      return result;
    } catch (error) {
      this.end(operation, { ...context, error: true });
      throw error;
    }
  }

  async measureAsync<T>(
    operation: string, 
    fn: () => Promise<T>, 
    context?: Record<string, any>
  ): Promise<T> {
    this.start(operation);
    try {
      const result = await fn();
      this.end(operation, context);
      return result;
    } catch (error) {
      this.end(operation, { ...context, error: true });
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Error tracking
export class ErrorTracker {
  track(error: Error, context?: Record<string, any>): void {
    logger.error('Unhandled error', error, {
      ...context,
      type: 'unhandled_error',
      stack: error.stack,
    });
  }

  trackAsync(error: Error, context?: Record<string, any>): void {
    logger.error('Async error', error, {
      ...context,
      type: 'async_error',
      stack: error.stack,
    });
  }
}

export const errorTracker = new ErrorTracker();
