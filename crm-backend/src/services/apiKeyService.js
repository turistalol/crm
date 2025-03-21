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
exports.ApiKeyService = void 0;
const crypto_1 = require("crypto");
const database_1 = __importDefault(require("../utils/database"));
const logger_1 = require("../utils/logger");
class ApiKeyService {
    constructor() {
        this.db = database_1.default;
    }
    generateApiKey() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    createApiKey(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const key = this.generateApiKey();
                return yield this.db.apiKey.create({
                    data: {
                        name: data.name,
                        key,
                        company: {
                            connect: { id: data.companyId }
                        }
                    }
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating API key:', error);
                throw error;
            }
        });
    }
    getApiKeys(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.apiKey.findMany({
                    where: { companyId },
                    orderBy: { createdAt: 'desc' }
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching API keys:', error);
                throw error;
            }
        });
    }
    getApiKeyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.apiKey.findUnique({
                    where: { id }
                });
            }
            catch (error) {
                logger_1.logger.error(`Error fetching API key with id ${id}:`, error);
                throw error;
            }
        });
    }
    updateApiKey(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.apiKey.update({
                    where: { id },
                    data
                });
            }
            catch (error) {
                logger_1.logger.error(`Error updating API key with id ${id}:`, error);
                throw error;
            }
        });
    }
    deleteApiKey(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.apiKey.delete({
                    where: { id }
                });
            }
            catch (error) {
                logger_1.logger.error(`Error deleting API key with id ${id}:`, error);
                throw error;
            }
        });
    }
    validateApiKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = yield this.db.apiKey.findUnique({
                    where: { key },
                    include: { company: true }
                });
                if (apiKey && apiKey.isActive) {
                    // Update last used timestamp
                    yield this.db.apiKey.update({
                        where: { id: apiKey.id },
                        data: { lastUsed: new Date() }
                    });
                    return apiKey;
                }
                return null;
            }
            catch (error) {
                logger_1.logger.error('Error validating API key:', error);
                throw error;
            }
        });
    }
}
exports.ApiKeyService = ApiKeyService;
exports.default = new ApiKeyService();
