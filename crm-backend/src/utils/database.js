"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
// Create Prisma Client instance
const prisma = new client_1.PrismaClient({
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
// Logging middleware
prisma.$on('query', (e) => {
    logger_1.logger.debug(`Query: ${e.query}`);
    logger_1.logger.debug(`Duration: ${e.duration}ms`);
});
prisma.$on('error', (e) => {
    logger_1.logger.error(`Prisma Error: ${e.message}`);
});
prisma.$on('info', (e) => {
    logger_1.logger.info(`Prisma Info: ${e.message}`);
});
prisma.$on('warn', (e) => {
    logger_1.logger.warn(`Prisma Warning: ${e.message}`);
});
// Export for use in the application
exports.default = prisma;
