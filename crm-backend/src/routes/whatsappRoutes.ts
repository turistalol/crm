import express from 'express';
import * as whatsappController from '../controllers/whatsappController';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../services/fileService';

const router = express.Router();

// Protected routes (require authentication)
router.get('/status', authenticate, whatsappController.getStatus);
router.post('/send-text', authenticate, whatsappController.sendText);
router.post('/send-media', authenticate, whatsappController.sendMedia);
router.post('/upload', authenticate, upload.single('file'), whatsappController.uploadMedia);
router.get('/queue-status', authenticate, whatsappController.getMessageQueueStatus);

// Admin routes (require manager role)
router.post('/initialize', authenticate, whatsappController.initializeInstance);

// Webhook route (no authentication required for Evolution API callbacks)
router.post('/webhook', whatsappController.processWebhook);

export default router; 