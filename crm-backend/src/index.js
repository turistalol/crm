"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const whatsappRoutes_1 = __importDefault(require("./routes/whatsappRoutes"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const publicApiRoutes_1 = __importDefault(require("./routes/publicApiRoutes"));
const socketService_1 = require("./services/socketService");
// Load environment variables based on environment
if (process.env.NODE_ENV === 'production') {
    dotenv_1.default.config({ path: '.env.production' });
}
else {
    dotenv_1.default.config();
}
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.io
(0, socketService_1.initializeSocketServer)(server);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Setup request logging
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.url}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0'
    });
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/teams', teamRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/whatsapp', whatsappRoutes_1.default);
app.use('/api', apiRoutes_1.default);
app.use('/api/public', publicApiRoutes_1.default);
// app.use('/api/users', userRoutes);
// 404 handler
app.use((req, res) => {
    logger_1.logger.warn(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route not found' });
});
// Use Sentry error handler in production
app.use(logger_1.sentryErrorHandler);
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error(`Error: ${err.message}`);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});
// Start server
server.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
    logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_1.logger.info('Socket.io server initialized');
});
// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
    });
});
exports.default = app;
