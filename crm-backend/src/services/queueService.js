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
exports.getQueueStatus = exports.queueMediaMessage = exports.queueTextMessage = void 0;
const bull_1 = __importDefault(require("bull"));
const logger_1 = require("../utils/logger");
const whatsappService_1 = require("./whatsappService");
// Create queues
const messageQueue = new bull_1.default('whatsapp-messages', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    }
});
// Process text messages
messageQueue.process('send-text', (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, message } = job.data;
        logger_1.logger.info(`Processing text message job for ${phoneNumber}`);
        const result = yield (0, whatsappService_1.sendTextMessage)(phoneNumber, message);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Error processing text message job: ${error.message}`);
        throw error;
    }
}));
// Process media messages
messageQueue.process('send-media', (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, url, caption, mediaType } = job.data;
        logger_1.logger.info(`Processing media message job for ${phoneNumber}`);
        const result = yield (0, whatsappService_1.sendMediaMessage)(phoneNumber, url, caption, mediaType);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Error processing media message job: ${error.message}`);
        throw error;
    }
}));
// Handle completed jobs
messageQueue.on('completed', (job) => {
    logger_1.logger.info(`Job ${job.id} completed successfully`);
});
// Handle failed jobs
messageQueue.on('failed', (job, error) => {
    logger_1.logger.error(`Job ${job.id} failed: ${error.message}`);
    // If job has reached max attempts
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
        logger_1.logger.error(`Job ${job.id} has failed all retry attempts`);
    }
});
/**
 * Add a text message to the queue
 */
const queueTextMessage = (phoneNumber, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield messageQueue.add('send-text', { phoneNumber, message });
        logger_1.logger.info(`Text message queued for ${phoneNumber}, job ID: ${job.id}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error(`Error queueing text message: ${error.message}`);
        throw error;
    }
});
exports.queueTextMessage = queueTextMessage;
/**
 * Add a media message to the queue
 */
const queueMediaMessage = (phoneNumber, url, caption, mediaType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield messageQueue.add('send-media', {
            phoneNumber,
            url,
            caption,
            mediaType
        });
        logger_1.logger.info(`Media message queued for ${phoneNumber}, job ID: ${job.id}`);
        return job;
    }
    catch (error) {
        logger_1.logger.error(`Error queueing media message: ${error.message}`);
        throw error;
    }
});
exports.queueMediaMessage = queueMediaMessage;
/**
 * Get queue status
 */
const getQueueStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [waiting, active, completed, failed] = yield Promise.all([
            messageQueue.getWaitingCount(),
            messageQueue.getActiveCount(),
            messageQueue.getCompletedCount(),
            messageQueue.getFailedCount()
        ]);
        return {
            waiting,
            active,
            completed,
            failed,
            total: waiting + active + completed + failed
        };
    }
    catch (error) {
        logger_1.logger.error(`Error getting queue status: ${error.message}`);
        throw error;
    }
});
exports.getQueueStatus = getQueueStatus;
