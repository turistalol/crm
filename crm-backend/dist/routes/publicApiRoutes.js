import express from 'express';
import apiController from '../controllers/apiController';
import { authenticateApiKey, rateLimitApiKey } from '../middlewares/apiKeyMiddleware';

const router = express.Router();

// Apply API key authentication and rate limiting to all routes
router.use(rateLimitApiKey);
router.use(authenticateApiKey);

// Public API routes
// These endpoints will be accessible by external applications using API keys

// Pipeline metrics
router.get('/metrics/pipeline/:pipelineId', apiController.getPipelineMetrics);

// Team metrics 
router.get('/metrics/team/:teamId', apiController.getTeamMetrics);

// Documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    name: 'CRM API Documentation',
    version: '1.0.0',
    description: 'Public API for accessing CRM data',
    endpoints: [
      {
        path: '/api/public/metrics/pipeline/:pipelineId',
        method: 'GET',
        description: 'Get pipeline performance metrics',
        parameters: {
          pipelineId: 'UUID of the pipeline',
          startDate: 'Optional query param for filtering (YYYY-MM-DD)',
          endDate: 'Optional query param for filtering (YYYY-MM-DD)'
        }
      },
      {
        path: '/api/public/metrics/team/:teamId',
        method: 'GET',
        description: 'Get team performance metrics',
        parameters: {
          teamId: 'UUID of the team',
          startDate: 'Optional query param for filtering (YYYY-MM-DD)',
          endDate: 'Optional query param for filtering (YYYY-MM-DD)'
        }
      }
    ],
    authentication: {
      method: 'API Key',
      header: 'X-API-Key',
      description: 'Include your API key in the X-API-Key header'
    },
    rateLimit: {
      limit: 60,
      window: '1 minute',
      header: 'Retry-After'
    }
  });
});

export default router; 