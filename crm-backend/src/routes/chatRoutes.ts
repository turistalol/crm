import express from 'express';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(authenticate);

// Contact routes
router.get('/contacts', chatController.getAllContacts);
router.get('/contacts/:id', chatController.getContactById);
router.post('/contacts', chatController.createContact);
router.put('/contacts/:id', chatController.updateContact);

// Chat routes
router.get('/chats', chatController.getAllChats);
router.get('/chats/:id', chatController.getChatById);
router.post('/chats', chatController.createChat);
router.put('/chats/:id/archive', chatController.toggleArchiveChat);

// Message routes
router.get('/chats/:chatId/messages', chatController.getMessagesByChat);
router.post('/messages', chatController.sendMessage);

// Quick reply routes
router.get('/quickreplies/:companyId', chatController.getQuickReplies);
router.post('/quickreplies', chatController.createQuickReply);
router.put('/quickreplies/:id', chatController.updateQuickReply);
router.delete('/quickreplies/:id', chatController.deleteQuickReply);

export default router; 