interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  userId?: string;
  action?: string;
  details?: any;
}

class Logger {
  private logs: LogEntry[] = [];

  private createLogEntry(level: LogEntry['level'], message: string, action?: string, details?: any, userId?: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      userId,
      action,
      details
    };
  }

  info(message: string, action?: string, details?: any, userId?: string) {
    const entry = this.createLogEntry('info', message, action, details, userId);
    this.logs.push(entry);
    console.log(`[${entry.timestamp}] INFO: ${message}`, details || '');
  }

  warn(message: string, action?: string, details?: any, userId?: string) {
    const entry = this.createLogEntry('warn', message, action, details, userId);
    this.logs.push(entry);
    console.warn(`[${entry.timestamp}] WARN: ${message}`, details || '');
  }

  error(message: string, action?: string, details?: any, userId?: string) {
    const entry = this.createLogEntry('error', message, action, details, userId);
    this.logs.push(entry);
    console.error(`[${entry.timestamp}] ERROR: ${message}`, details || '');
  }

  debug(message: string, action?: string, details?: any, userId?: string) {
    const entry = this.createLogEntry('debug', message, action, details, userId);
    this.logs.push(entry);
    console.debug(`[${entry.timestamp}] DEBUG: ${message}`, details || '');
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();