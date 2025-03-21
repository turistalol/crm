"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pipelineController_1 = require("../controllers/pipelineController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticate);
// Pipeline routes
router.get('/team/:teamId', pipelineController_1.getPipelines);
router.get('/:id', pipelineController_1.getPipeline);
router.post('/', pipelineController_1.createPipeline);
router.put('/:id', pipelineController_1.updatePipeline);
router.delete('/:id', pipelineController_1.deletePipeline);
// Stage routes
router.post('/:pipelineId/stages', pipelineController_1.createStage);
router.put('/stages/:id', pipelineController_1.updateStage);
router.delete('/stages/:id', pipelineController_1.deleteStage);
router.put('/:pipelineId/stages/reorder', pipelineController_1.reorderStages);
exports.default = router;
