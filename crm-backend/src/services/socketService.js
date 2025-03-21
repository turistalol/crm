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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessageStatus = exports.emitToChat = exports.emitToUser = exports.getSocketServer = exports.initializeSocketServer = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../utils/database"));
const logger_1 = require("../utils/logger");
const chat_1 = require("../models/chat");
let io;
/**
 * Verify JWT token
 */
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
});
/**
 * Initialize socket.io server
 */
const initializeSocketServer = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // Socket.io middleware for authentication
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: Token not provided'));
            }
            const decoded = yield verifyToken(token);
            if (!decoded) {
                return next(new Error('Authentication error: Invalid token'));
            }
            // Attach user data to socket
            socket.data.user = decoded;
            next();
        }
        catch (error) {
            logger_1.logger.error(`Socket authentication error: ${error.message}`);
            next(new Error('Authentication error'));
        }
    }));
    // Socket.io connection handler
    io.on('connection', (socket) => {
        const userId = socket.data.user.id;
        logger_1.logger.info(`User connected: ${userId}`);
        // Add user to their own room for targeted messages
        socket.join(`user:${userId}`);
        // Handle message sending
        socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { chatId, message, mediaUrl, mediaType } = data;
                // Get chat details
                const chat = yield database_1.default.chat.findUnique({
                    where: { id: chatId },
                    include: { contact: true }
                });
                if (!chat) {
                    throw new Error('Chat not found');
                }
                // Create message in database
                const newMessage = yield database_1.default.message.create({
                    data: {
                        content: message,
                        mediaUrl,
                        mediaType,
                        direction: chat_1.MessageDirection.OUTBOUND,
                        status: chat_1.MessageStatus.SENT,
                        contactId: chat.contactId,
                        chatId: chat.id
                    },
                    include: {
                        contact: true
                    }
                });
                // Update the last message of the chat
                yield database_1.default.chat.update({
                    where: { id: chatId },
                    data: { lastMessageId: newMessage.id }
                });
                // Emit message to all connected clients interested in this chat
                io.to(`chat:${chatId}`).emit('new_message', newMessage);
                // Send message to WhatsApp via Evolution API
                // This would be handled by the WhatsApp service
                // For now, we'll just log it
                logger_1.logger.info(`Message sent to ${chat.contact.phoneNumber}: ${message}`);
            }
            catch (error) {
                logger_1.logger.error(`Error sending message: ${error.message}`);
                socket.emit('error', { message: 'Failed to send message' });
            }
        }));
        // Handle typing status
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(`chat:${chatId}`).emit('typing_status', {
                userId,
                chatId,
                isTyping
            });
        });
        // Join a chat room when user opens a chat
        socket.on('join_chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            logger_1.logger.info(`User ${userId} joined chat: ${chatId}`);
        });
        // Leave a chat room when user closes a chat
        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            logger_1.logger.info(`User ${userId} left chat: ${chatId}`);
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            logger_1.logger.info(`User disconnected: ${userId}`);
        });
    });
    return io;
};
exports.initializeSocketServer = initializeSocketServer;
/**
 * Get socket.io instance
 */
const getSocketServer = () => {
    if (!io) {
        throw new Error('Socket.io server not initialized');
    }
    return io;
};
exports.getSocketServer = getSocketServer;
/**
 * Emit event to a specific user
 */
const emitToUser = (userId, event, data) => {
    if (!io) {
        logger_1.logger.error('Socket.io server not initialized');
        return;
    }
    io.to(`user:${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
/**
 * Emit event to a specific chat room
 */
const emitToChat = (chatId, event, data) => {
    if (!io) {
        logger_1.logger.error('Socket.io server not initialized');
        return;
    }
    io.to(`chat:${chatId}`).emit(event, data);
};
exports.emitToChat = emitToChat;
/**
 * Update message status and notify clients
 */
const updateMessageStatus = (messageId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield database_1.default.message.update({
            where: { id: messageId },
            data: { status },
            include: { chat: true }
        });
        (0, exports.emitToChat)(message.chatId, 'message_status', {
            messageId,
            status
        });
        return message;
    }
    catch (error) {
        logger_1.logger.error(`Error updating message status: ${error.message}`);
        throw error;
    }
});
exports.updateMessageStatus = updateMessageStatus;
