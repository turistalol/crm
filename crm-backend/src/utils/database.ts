import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Create Prisma Client instance
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Define event parameter types
interface QueryEvent {
  query: string;
  duration: number;
}

interface LogEvent {
  message: string;
}

// Logging middleware
prisma.$on('query', (e: QueryEvent) => {
  logger.debug(`Query: ${e.query}`);
  logger.debug(`Duration: ${e.duration}ms`);
});

prisma.$on('error', (e: LogEvent) => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('info', (e: LogEvent) => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', (e: LogEvent) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

// Export for use in the application
export default prisma; 