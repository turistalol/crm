import express from 'express';
import {
  getPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from '../controllers/pipelineController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Pipeline routes
router.get('/team/:teamId', getPipelines);
router.get('/:id', getPipeline);
router.post('/', createPipeline);
router.put('/:id', updatePipeline);
router.delete('/:id', deletePipeline);

// Stage routes
router.post('/:pipelineId/stages', createStage);
router.put('/stages/:id', updateStage);
router.delete('/stages/:id', deleteStage);
router.put('/:pipelineId/stages/reorder', reorderStages);

export default router; 