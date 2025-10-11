/**
 * Client-side logger utility
 * Provides consistent logging interface for browser console
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
}

class ClientLogger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
      enabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= configLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'debug':
      case 'trace':
        console.debug(prefix, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }

  trace(message: string, ...args: any[]): void {
    if (this.shouldLog('trace')) {
      this.formatMessage('trace', message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      this.formatMessage('debug', message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      this.formatMessage('info', message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      this.formatMessage('warn', message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      this.formatMessage('error', message, ...args);
    }
  }

  // Group logging for related messages
  group(label: string): void {
    if (this.config.enabled) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.config.enabled) {
      console.groupEnd();
    }
  }

  // Table logging for structured data
  table(data: any): void {
    if (this.config.enabled) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = new ClientLogger();

// Export for testing or custom instances
export { ClientLogger };
