import winston from 'winston';
import * as Sentry from '@sentry/node';
import TransportStream from 'winston-transport';

// Initialize Sentry if in production and DSN is provided
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
  
  console.log('Sentry initialized for error tracking');
}

// Create a Sentry transport for Winston
class SentryTransport extends TransportStream {
  constructor(opts?: winston.transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    const { level, message, ...meta } = info;
    
    if (level === 'error' || level === 'warn') {
      Sentry.captureMessage(message, {
        level: level === 'error' ? 'error' : 'warning',
        extra: meta,
      });
    }
    
    callback();
  }
}

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  defaultMeta: { service: 'crm-backend' },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // Write to error log file (production only)
    ...(process.env.NODE_ENV === 'production' 
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
          // Add Sentry transport in production if DSN exists
          ...(process.env.SENTRY_DSN ? [new SentryTransport({ level: 'warn' })] : [])
        ] 
      : [])
  ],
});

// Export a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Error handler middleware for Express
export const sentryErrorHandler = (err: any, req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  logger.error(`${err.stack || err.message || err}`);
  next(err);
}; 