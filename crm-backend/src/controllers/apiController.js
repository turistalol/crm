"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const apiKeyService_1 = __importDefault(require("../services/apiKeyService"));
const webhookService_1 = __importDefault(require("../services/webhookService"));
const reportService_1 = __importDefault(require("../services/reportService"));
const logger_1 = require("../utils/logger");
class ApiController {
    // API Keys endpoints
    createApiKey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, companyId } = req.body;
                if (!name || !companyId) {
                    return res.status(400).json({ message: 'Name and companyId are required' });
                }
                const apiKey = yield apiKeyService_1.default.createApiKey({ name, companyId });
                return res.status(201).json(apiKey);
            }
            catch (error) {
                logger_1.logger.error('Error creating API key:', error);
                return res.status(500).json({ message: 'Failed to create API key' });
            }
        });
    }
    getApiKeys(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                if (!companyId) {
                    return res.status(400).json({ message: 'Company ID is required' });
                }
                const apiKeys = yield apiKeyService_1.default.getApiKeys(companyId);
                return res.status(200).json(apiKeys);
            }
            catch (error) {
                logger_1.logger.error('Error fetching API keys:', error);
                return res.status(500).json({ message: 'Failed to fetch API keys' });
            }
        });
    }
    getApiKeyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const apiKey = yield apiKeyService_1.default.getApiKeyById(id);
                if (!apiKey) {
                    return res.status(404).json({ message: 'API key not found' });
                }
                return res.status(200).json(apiKey);
            }
            catch (error) {
                logger_1.logger.error(`Error fetching API key with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to fetch API key' });
            }
        });
    }
    updateApiKey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, isActive } = req.body;
                if (!name && isActive === undefined) {
                    return res.status(400).json({ message: 'At least one field to update is required' });
                }
                const apiKey = yield apiKeyService_1.default.updateApiKey(id, { name, isActive });
                return res.status(200).json(apiKey);
            }
            catch (error) {
                logger_1.logger.error(`Error updating API key with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to update API key' });
            }
        });
    }
    deleteApiKey(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield apiKeyService_1.default.deleteApiKey(id);
                return res.status(204).send();
            }
            catch (error) {
                logger_1.logger.error(`Error deleting API key with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to delete API key' });
            }
        });
    }
    // Webhooks endpoints
    createWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, url, events, companyId } = req.body;
                if (!name || !url || !events || !companyId) {
                    return res.status(400).json({
                        message: 'Name, URL, events, and companyId are required'
                    });
                }
                const webhook = yield webhookService_1.default.createWebhook({
                    name,
                    url,
                    events,
                    companyId
                });
                return res.status(201).json(webhook);
            }
            catch (error) {
                logger_1.logger.error('Error creating webhook:', error);
                return res.status(500).json({ message: 'Failed to create webhook' });
            }
        });
    }
    getWebhooks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                if (!companyId) {
                    return res.status(400).json({ message: 'Company ID is required' });
                }
                const webhooks = yield webhookService_1.default.getWebhooks(companyId);
                return res.status(200).json(webhooks);
            }
            catch (error) {
                logger_1.logger.error('Error fetching webhooks:', error);
                return res.status(500).json({ message: 'Failed to fetch webhooks' });
            }
        });
    }
    getWebhookById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const webhook = yield webhookService_1.default.getWebhookById(id);
                if (!webhook) {
                    return res.status(404).json({ message: 'Webhook not found' });
                }
                return res.status(200).json(webhook);
            }
            catch (error) {
                logger_1.logger.error(`Error fetching webhook with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to fetch webhook' });
            }
        });
    }
    updateWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, url, events, isActive } = req.body;
                if (!name && !url && !events && isActive === undefined) {
                    return res.status(400).json({
                        message: 'At least one field to update is required'
                    });
                }
                const webhook = yield webhookService_1.default.updateWebhook(id, {
                    name,
                    url,
                    events,
                    isActive
                });
                return res.status(200).json(webhook);
            }
            catch (error) {
                logger_1.logger.error(`Error updating webhook with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to update webhook' });
            }
        });
    }
    deleteWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield webhookService_1.default.deleteWebhook(id);
                return res.status(204).send();
            }
            catch (error) {
                logger_1.logger.error(`Error deleting webhook with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to delete webhook' });
            }
        });
    }
    // Reports endpoints
    createReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, type, filters, companyId, createdById } = req.body;
                if (!name || !type || !companyId || !createdById) {
                    return res.status(400).json({
                        message: 'Name, type, companyId, and createdById are required'
                    });
                }
                const report = yield reportService_1.default.createReport({
                    name,
                    type,
                    filters,
                    companyId,
                    createdById
                });
                return res.status(201).json(report);
            }
            catch (error) {
                logger_1.logger.error('Error creating report:', error);
                return res.status(500).json({ message: 'Failed to create report' });
            }
        });
    }
    getReports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyId } = req.params;
                if (!companyId) {
                    return res.status(400).json({ message: 'Company ID is required' });
                }
                const reports = yield reportService_1.default.getReports(companyId);
                return res.status(200).json(reports);
            }
            catch (error) {
                logger_1.logger.error('Error fetching reports:', error);
                return res.status(500).json({ message: 'Failed to fetch reports' });
            }
        });
    }
    getReportById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const report = yield reportService_1.default.getReportById(id);
                if (!report) {
                    return res.status(404).json({ message: 'Report not found' });
                }
                return res.status(200).json(report);
            }
            catch (error) {
                logger_1.logger.error(`Error fetching report with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to fetch report' });
            }
        });
    }
    updateReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, filters } = req.body;
                if (!name && !filters) {
                    return res.status(400).json({
                        message: 'At least one field to update is required'
                    });
                }
                const report = yield reportService_1.default.updateReport(id, { name, filters });
                return res.status(200).json(report);
            }
            catch (error) {
                logger_1.logger.error(`Error updating report with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to update report' });
            }
        });
    }
    deleteReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield reportService_1.default.deleteReport(id);
                return res.status(204).send();
            }
            catch (error) {
                logger_1.logger.error(`Error deleting report with id ${req.params.id}:`, error);
                return res.status(500).json({ message: 'Failed to delete report' });
            }
        });
    }
    // Metrics endpoints
    getPipelineMetrics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { pipelineId } = req.params;
                const { startDate, endDate } = req.query;
                if (!pipelineId) {
                    return res.status(400).json({ message: 'Pipeline ID is required' });
                }
                let dateRange;
                if (startDate && endDate) {
                    dateRange = {
                        start: new Date(startDate),
                        end: new Date(endDate),
                    };
                }
                const metrics = yield reportService_1.default.getPipelineMetrics(pipelineId, dateRange);
                return res.status(200).json(metrics);
            }
            catch (error) {
                logger_1.logger.error(`Error generating pipeline metrics for ${req.params.pipelineId}:`, error);
                return res.status(500).json({ message: 'Failed to generate pipeline metrics' });
            }
        });
    }
    getTeamMetrics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const { startDate, endDate } = req.query;
                if (!teamId) {
                    return res.status(400).json({ message: 'Team ID is required' });
                }
                let dateRange;
                if (startDate && endDate) {
                    dateRange = {
                        start: new Date(startDate),
                        end: new Date(endDate),
                    };
                }
                const metrics = yield reportService_1.default.getTeamPerformanceMetrics(teamId, dateRange);
                return res.status(200).json(metrics);
            }
            catch (error) {
                logger_1.logger.error(`Error generating team metrics for ${req.params.teamId}:`, error);
                return res.status(500).json({ message: 'Failed to generate team metrics' });
            }
        });
    }
}
exports.ApiController = ApiController;
exports.default = new ApiController();
