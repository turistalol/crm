import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database';
import { logger } from '../utils/logger';
import { MessageDirection, MessageStatus } from '../models/chat';

let io: SocketServer;

/**
 * Verify JWT token
 */
const verifyToken = async (token: string): Promise<any> => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Initialize socket.io server
 */
export const initializeSocketServer = (server: Server) => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user data to socket
      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${(error as Error).message}`);
      next(new Error('Authentication error'));
    }
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    logger.info(`User connected: ${userId}`);

    // Add user to their own room for targeted messages
    socket.join(`user:${userId}`);

    // Handle message sending
    socket.on('send_message', async (data) => {
      try {
        const { chatId, message, mediaUrl, mediaType } = data;

        // Get chat details
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          include: { contact: true }
        });

        if (!chat) {
          throw new Error('Chat not found');
        }

        // Create message in database
        const newMessage = await prisma.message.create({
          data: {
            content: message,
            mediaUrl,
            mediaType,
            direction: MessageDirection.OUTBOUND,
            status: MessageStatus.SENT,
            contactId: chat.contactId,
            chatId: chat.id
          },
          include: {
            contact: true
          }
        });

        // Update the last message of the chat
        await prisma.chat.update({
          where: { id: chatId },
          data: { lastMessageId: newMessage.id }
        });

        // Emit message to all connected clients interested in this chat
        io.to(`chat:${chatId}`).emit('new_message', newMessage);

        // Send message to WhatsApp via Evolution API
        // This would be handled by the WhatsApp service
        // For now, we'll just log it
        logger.info(`Message sent to ${chat.contact.phoneNumber}: ${message}`);

      } catch (error) {
        logger.error(`Error sending message: ${(error as Error).message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

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
      logger.info(`User ${userId} joined chat: ${chatId}`);
    });

    // Leave a chat room when user closes a chat
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      logger.info(`User ${userId} left chat: ${chatId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });
  });

  return io;
};

/**
 * Get socket.io instance
 */
export const getSocketServer = () => {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
};

/**
 * Emit event to a specific user
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    logger.error('Socket.io server not initialized');
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to a specific chat room
 */
export const emitToChat = (chatId: string, event: string, data: any) => {
  if (!io) {
    logger.error('Socket.io server not initialized');
    return;
  }
  io.to(`chat:${chatId}`).emit(event, data);
};

/**
 * Update message status and notify clients
 */
export const updateMessageStatus = async (messageId: string, status: MessageStatus) => {
  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { status },
      include: { chat: true }
    });

    emitToChat(message.chatId, 'message_status', {
      messageId,
      status
    });

    return message;
  } catch (error) {
    logger.error(`Error updating message status: ${(error as Error).message}`);
    throw error;
  }
}; 