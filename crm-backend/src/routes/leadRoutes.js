"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leadController_1 = require("../controllers/leadController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticate);
// Lead routes
router.get('/', leadController_1.getLeads);
router.get('/:id', leadController_1.getLead);
router.post('/', leadController_1.createLead);
router.put('/:id', leadController_1.updateLead);
router.delete('/:id', leadController_1.deleteLead);
// Lead actions
router.post('/:id/move', leadController_1.moveLeadToStage);
router.post('/:id/tags', leadController_1.addTagToLead);
router.delete('/:id/tags/:tagId', leadController_1.removeTagFromLead);
exports.default = router;
