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
exports.WebhookService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../utils/database"));
const logger_1 = require("../utils/logger");
class WebhookService {
    constructor() {
        this.db = database_1.default;
    }
    generateSecret() {
        return crypto_1.default.randomBytes(24).toString('hex');
    }
    createWebhook(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secret = this.generateSecret();
                return yield this.db.webhook.create({
                    data: {
                        name: data.name,
                        url: data.url,
                        secret,
                        events: data.events,
                        company: {
                            connect: { id: data.companyId }
                        }
                    }
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating webhook:', error);
                throw error;
            }
        });
    }
    getWebhooks(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.webhook.findMany({
                    where: { companyId },
                    orderBy: { createdAt: 'desc' }
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching webhooks:', error);
                throw error;
            }
        });
    }
    getWebhookById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.webhook.findUnique({
                    where: { id }
                });
            }
            catch (error) {
                logger_1.logger.error(`Error fetching webhook with id ${id}:`, error);
                throw error;
            }
        });
    }
    updateWebhook(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.webhook.update({
                    where: { id },
                    data
                });
            }
            catch (error) {
                logger_1.logger.error(`Error updating webhook with id ${id}:`, error);
                throw error;
            }
        });
    }
    deleteWebhook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.webhook.delete({
                    where: { id }
                });
            }
            catch (error) {
                logger_1.logger.error(`Error deleting webhook with id ${id}:`, error);
                throw error;
            }
        });
    }
    triggerWebhooks(event, companyId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find all active webhooks for this event and company
                const webhooks = yield this.db.webhook.findMany({
                    where: {
                        companyId,
                        isActive: true,
                        events: {
                            has: event
                        }
                    }
                });
                if (webhooks.length === 0) {
                    return;
                }
                // Send the webhook events in parallel
                const results = yield Promise.all(webhooks.map((webhook) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // Create HMAC signature for payload
                        const timestamp = Date.now().toString();
                        const payloadString = JSON.stringify(payload);
                        const signature = this.generateSignature(webhook.secret, payloadString, timestamp);
                        // Send webhook request
                        yield axios_1.default.post(webhook.url, payload, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CRM-Webhook-Signature': signature,
                                'X-CRM-Webhook-Timestamp': timestamp,
                                'X-CRM-Webhook-Event': event
                            },
                            timeout: 5000 // 5 second timeout
                        });
                        return { webhookId: webhook.id, success: true };
                    }
                    catch (error) {
                        logger_1.logger.error(`Error sending webhook ${webhook.id} to ${webhook.url}:`, error);
                        return { webhookId: webhook.id, success: false, error };
                    }
                })));
                // Log the results
                const failures = results.filter(r => !r.success);
                if (failures.length > 0) {
                    logger_1.logger.warn(`Failed to send ${failures.length} of ${webhooks.length} webhooks for event ${event}`);
                }
                else {
                    logger_1.logger.info(`Successfully sent ${webhooks.length} webhooks for event ${event}`);
                }
                return results;
            }
            catch (error) {
                logger_1.logger.error(`Error triggering webhooks for event ${event}:`, error);
                throw error;
            }
        });
    }
    // Generate HMAC signature for webhook payload
    generateSignature(secret, payload, timestamp) {
        const signatureData = `${timestamp}.${payload}`;
        return crypto_1.default
            .createHmac('sha256', secret)
            .update(signatureData)
            .digest('hex');
    }
    // Verify webhook signature for incoming requests
    verifySignature(secret, payload, signature, timestamp) {
        const expectedSignature = this.generateSignature(secret, payload, timestamp);
        return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
}
exports.WebhookService = WebhookService;
exports.default = new WebhookService();
