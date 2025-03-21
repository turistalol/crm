import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger, sentryErrorHandler } from './utils/logger';
import authRoutes from './routes/authRoutes';
import teamRoutes from './routes/teamRoutes';
import chatRoutes from './routes/chatRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import apiRoutes from './routes/apiRoutes';
import publicApiRoutes from './routes/publicApiRoutes';
import { initializeSocketServer } from './services/socketService';
import * as Sentry from '@sentry/node';

// Load environment variables based on environment
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

// Initialize express app
const app: Application = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocketServer(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api', apiRoutes);
app.use('/api/public', publicApiRoutes);
// app.use('/api/users', userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Use Sentry error handler in production
app.use(sentryErrorHandler);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Socket.io server initialized');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app; 