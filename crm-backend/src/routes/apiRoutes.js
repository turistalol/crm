"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiController_1 = __importDefault(require("../controllers/apiController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// API Key routes - require admin access
router.post('/keys', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.createApiKey);
router.get('/keys/company/:companyId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.getApiKeys);
router.get('/keys/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.getApiKeyById);
router.put('/keys/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.updateApiKey);
router.delete('/keys/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.deleteApiKey);
// Webhook routes
router.post('/webhooks', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.createWebhook);
router.get('/webhooks/company/:companyId', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.MANAGER]), apiController_1.default.getWebhooks);
router.get('/webhooks/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.MANAGER]), apiController_1.default.getWebhookById);
router.put('/webhooks/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.updateWebhook);
router.delete('/webhooks/:id', authMiddleware_1.authenticate, (0, authMiddleware_1.authorize)([client_1.Role.ADMIN]), apiController_1.default.deleteWebhook);
// Report routes
router.post('/reports', authMiddleware_1.authenticate, apiController_1.default.createReport);
router.get('/reports/company/:companyId', authMiddleware_1.authenticate, apiController_1.default.getReports);
router.get('/reports/:id', authMiddleware_1.authenticate, apiController_1.default.getReportById);
router.put('/reports/:id', authMiddleware_1.authenticate, apiController_1.default.updateReport);
router.delete('/reports/:id', authMiddleware_1.authenticate, apiController_1.default.deleteReport);
// Metrics routes
router.get('/metrics/pipeline/:pipelineId', authMiddleware_1.authenticate, apiController_1.default.getPipelineMetrics);
router.get('/metrics/team/:teamId', authMiddleware_1.authenticate, apiController_1.default.getTeamMetrics);
exports.default = router;
