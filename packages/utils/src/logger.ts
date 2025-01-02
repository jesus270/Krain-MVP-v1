// Generic user interface for logging
interface BaseUser {
  id?: string;
  walletAddress?: string;
}

interface LogContext {
  operation: string;
  userId?: string;
  walletAddress?: string;
  errorCode?: string;
  entity?: string;
  [key: string]: any;
}

interface ErrorWithCode extends Error {
  code?: string;
}

interface LogEntry {
  level: "error" | "info" | "warn";
  message: string;
  context: LogContext;
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
  stack?: string;
}

interface LogTransport {
  log(entry: LogEntry): void;
}

// Console transport for development
class ConsoleTransport implements LogTransport {
  log(entry: LogEntry): void {
    const entity = entry.context.entity ? `[${entry.context.entity}]` : "";
    const prefix = `[${entry.level.toUpperCase()}]${entity}`;
    const logData = {
      ...entry.context,
      timestamp: entry.timestamp,
      ...(entry.errorCode && { errorCode: entry.errorCode }),
      ...(entry.errorMessage && { errorMessage: entry.errorMessage }),
      ...(entry.stack && { stack: entry.stack }),
    };

    switch (entry.level) {
      case "error":
        console.error(`${prefix} ${entry.message}`, logData);
        break;
      case "warn":
        console.warn(`${prefix} ${entry.message}`, logData);
        break;
      case "info":
        console.info(`${prefix} ${entry.message}`, logData);
        break;
    }
  }
}

// Production transport that can be extended for cloud logging services
class ProductionTransport implements LogTransport {
  log(entry: LogEntry): void {
    // In production, we would send this to a logging service
    // For now, use console but with structured JSON output
    const logData = {
      level: entry.level,
      message: entry.message,
      ...entry.context,
      timestamp: entry.timestamp,
      ...(entry.errorCode && { errorCode: entry.errorCode }),
      ...(entry.errorMessage && { errorMessage: entry.errorMessage }),
      ...(entry.stack && { stack: entry.stack }),
    };

    // Output as JSON for better parsing by logging services
    console.log(JSON.stringify(logData));
  }
}

class Logger {
  private transport: LogTransport;

  constructor() {
    this.transport =
      process.env.NODE_ENV === "production"
        ? new ProductionTransport()
        : new ConsoleTransport();
  }

  private createLogEntry(
    level: "error" | "info" | "warn",
    messageOrError: string | Error | unknown,
    context: LogContext,
  ): LogEntry {
    const timestamp = new Date().toISOString();
    const isError = messageOrError instanceof Error;
    const errorMessage = isError
      ? messageOrError.message
      : String(messageOrError);
    const errorCode = (messageOrError as ErrorWithCode)?.code;

    return {
      level,
      message: isError ? errorMessage : (messageOrError as string),
      context,
      timestamp,
      ...(isError && {
        errorCode: errorCode || context.errorCode || "UNKNOWN_ERROR",
        errorMessage,
        stack:
          messageOrError instanceof Error ? messageOrError.stack : undefined,
      }),
    };
  }

  error(error: Error | unknown, context: LogContext): void {
    this.transport.log(this.createLogEntry("error", error, context));
  }

  info(message: string, context: LogContext): void {
    this.transport.log(this.createLogEntry("info", message, context));
  }

  warn(message: string, context: LogContext): void {
    this.transport.log(this.createLogEntry("warn", message, context));
  }
}

export const log = new Logger();

export function createUserContext(user: BaseUser | null) {
  return {
    userId: user?.id,
    walletAddress: user?.walletAddress,
  };
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Common error codes
export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_INPUT: "INVALID_INPUT",
  NOT_FOUND: "NOT_FOUND",
  DATABASE_ERROR: "DATABASE_ERROR",
  REDIS_ERROR: "REDIS_ERROR",
  WALLET_ERROR: "WALLET_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;
