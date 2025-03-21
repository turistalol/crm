import express from 'express';
import apiController from '../controllers/apiController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = express.Router();

// API Key routes - require admin access
router.post('/keys', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.createApiKey
);

router.get('/keys/company/:companyId', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.getApiKeys
);

router.get('/keys/:id', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.getApiKeyById
);

router.put('/keys/:id', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.updateApiKey
);

router.delete('/keys/:id', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.deleteApiKey
);

// Webhook routes
router.post('/webhooks', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.createWebhook
);

router.get('/webhooks/company/:companyId', 
  authenticate, 
  authorize([Role.ADMIN, Role.MANAGER]), 
  apiController.getWebhooks
);

router.get('/webhooks/:id', 
  authenticate, 
  authorize([Role.ADMIN, Role.MANAGER]), 
  apiController.getWebhookById
);

router.put('/webhooks/:id', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.updateWebhook
);

router.delete('/webhooks/:id', 
  authenticate, 
  authorize([Role.ADMIN]), 
  apiController.deleteWebhook
);

// Report routes
router.post('/reports', 
  authenticate, 
  apiController.createReport
);

router.get('/reports/company/:companyId', 
  authenticate, 
  apiController.getReports
);

router.get('/reports/:id', 
  authenticate, 
  apiController.getReportById
);

router.put('/reports/:id', 
  authenticate, 
  apiController.updateReport
);

router.delete('/reports/:id', 
  authenticate, 
  apiController.deleteReport
);

// Metrics routes
router.get('/metrics/pipeline/:pipelineId', 
  authenticate, 
  apiController.getPipelineMetrics
);

router.get('/metrics/team/:teamId', 
  authenticate, 
  apiController.getTeamMetrics
);

export default router; 