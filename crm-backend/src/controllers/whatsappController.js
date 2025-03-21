"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConnectionMonitoring = exports.getMessageQueueStatus = exports.uploadMedia = exports.sendMedia = exports.sendText = exports.processWebhook = exports.getStatus = exports.initializeInstance = void 0;
const whatsappService_1 = require("../services/whatsappService");
const queueService_1 = require("../services/queueService");
const fileService_1 = require("../services/fileService");
const logger_1 = require("../utils/logger");
const socketService_1 = require("../services/socketService");
/**
 * Initialize WhatsApp connection
 */
const initializeInstance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, whatsappService_1.initializeWhatsApp)();
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.error(`Error initializing WhatsApp: ${error.message}`);
        return res.status(500).json({ error: 'Failed to initialize WhatsApp connection' });
    }
});
exports.initializeInstance = initializeInstance;
/**
 * Get connection status
 */
const getStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = yield (0, whatsappService_1.getInstanceStatus)();
        return res.status(200).json(status);
    }
    catch (error) {
        logger_1.logger.error(`Error getting WhatsApp status: ${error.message}`);
        return res.status(500).json({ error: 'Failed to get WhatsApp status' });
    }
});
exports.getStatus = getStatus;
/**
 * Handle incoming webhook from Evolution API
 */
const processWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webhookData = req.body;
        logger_1.logger.info(`Received webhook: ${JSON.stringify(webhookData)}`);
        // Process the webhook event
        const result = yield (0, whatsappService_1.processWebhook)(webhookData);
        // Emit the new message to connected clients if applicable
        if (result.data && result.data.chatId) {
            const io = (0, socketService_1.getSocketServer)();
            io.to(`chat:${result.data.chatId}`).emit('new_message', result.data);
        }
        return res.status(200).json({ success: true });
    }
    catch (error) {
        logger_1.logger.error(`Error processing webhook: ${error.message}`);
        return res.status(500).json({ error: 'Failed to process webhook' });
    }
});
exports.processWebhook = processWebhook;
/**
 * Send a text message
 */
const sendText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = yield (0, whatsappService_1.sendTextMessage)(to, message);
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.error(`Error sending message: ${error.message}`);
        return res.status(500).json({ error: 'Failed to send message' });
    }
});
exports.sendText = sendText;
/**
 * Send a media message
 */
const sendMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { to, url, caption, mediaType } = req.body;
        if (!to || !url || !mediaType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = yield (0, whatsappService_1.sendMediaMessage)(to, url, caption || '', mediaType);
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.error(`Error sending media: ${error.message}`);
        return res.status(500).json({ error: 'Failed to send media' });
    }
});
exports.sendMedia = sendMedia;
/**
 * Upload media for WhatsApp message
 */
const uploadMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }
        // Upload file to storage (S3 or local)
        const fileData = yield (0, fileService_1.uploadToS3)(req.file);
        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: fileData.url,
                key: fileData.key,
                mimeType: req.file.mimetype
            }
        });
    }
    catch (error) {
        logger_1.logger.error(`Error uploading media: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to upload media' });
    }
});
exports.uploadMedia = uploadMedia;
/**
 * Get status of the message queue
 */
const getMessageQueueStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = yield (0, queueService_1.getQueueStatus)();
        res.status(200).json({
            success: true,
            data: status
        });
    }
    catch (error) {
        logger_1.logger.error(`Error getting queue status: ${error.message}`);
        res.status(500).json({ success: false, message: 'Failed to get queue status' });
    }
});
exports.getMessageQueueStatus = getMessageQueueStatus;
/**
 * Check connection status periodically and notify clients
 */
const startConnectionMonitoring = () => {
    const CHECK_INTERVAL = 30000; // Check every 30 seconds
    const checkConnection = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const status = yield (0, whatsappService_1.getInstanceStatus)();
            const io = (0, socketService_1.getSocketServer)();
            // Broadcast connection status to all connected clients
            io.emit('whatsapp_status', {
                connected: ((_a = status.instance) === null || _a === void 0 ? void 0 : _a.state) === 'open',
                state: ((_b = status.instance) === null || _b === void 0 ? void 0 : _b.state) || 'disconnected',
                timestamp: new Date().toISOString()
            });
            // If disconnected, try to reconnect
            if (((_c = status.instance) === null || _c === void 0 ? void 0 : _c.state) !== 'open') {
                logger_1.logger.warn('WhatsApp connection is not open, attempting to reconnect');
                yield (0, whatsappService_1.initializeWhatsApp)();
            }
        }
        catch (error) {
            logger_1.logger.error(`Connection monitoring error: ${error.message}`);
            // Notify clients about the error
            const io = (0, socketService_1.getSocketServer)();
            io.emit('whatsapp_status', {
                connected: false,
                state: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });
    // Run an initial check
    checkConnection();
    // Set up the interval
    const interval = setInterval(checkConnection, CHECK_INTERVAL);
    // Return the interval ID so it can be cleared if needed
    return interval;
};
exports.startConnectionMonitoring = startConnectionMonitoring;
