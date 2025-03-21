import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  moveLeadToStage,
  addTagToLead,
  removeTagFromLead,
} from '../controllers/leadController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Lead routes
router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

// Lead actions
router.post('/:id/move', moveLeadToStage);
router.post('/:id/tags', addTagToLead);
router.delete('/:id/tags/:tagId', removeTagFromLead);

export default router; 