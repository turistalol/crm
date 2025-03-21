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
exports.CompanyService = void 0;
const database_1 = __importDefault(require("../utils/database"));
const logger_1 = require("../utils/logger");
/**
 * Service for managing company operations
 */
class CompanyService {
    /**
     * Create a new company
     */
    createCompany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.info(`Creating new company: ${data.name}`);
                const company = yield database_1.default.company.create({
                    data
                });
                return company;
            }
            catch (error) {
                logger_1.logger.error(`Error creating company: ${error.message}`);
                throw error;
            }
        });
    }
    /**
     * Get company by ID
     */
    getCompanyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.company.findUnique({
                    where: { id }
                });
            }
            catch (error) {
                logger_1.logger.error(`Error fetching company by ID: ${error.message}`);
                throw error;
            }
        });
    }
    /**
     * Get all companies with pagination
     */
    getAllCompanies() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            try {
                const skip = (page - 1) * limit;
                const [companies, total] = yield Promise.all([
                    database_1.default.company.findMany({
                        skip,
                        take: limit,
                        orderBy: { createdAt: 'desc' }
                    }),
                    database_1.default.company.count()
                ]);
                return { companies, total };
            }
            catch (error) {
                logger_1.logger.error(`Error fetching companies: ${error.message}`);
                throw error;
            }
        });
    }
    /**
     * Update company by ID
     */
    updateCompany(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.info(`Updating company ${id}`);
                return yield database_1.default.company.update({
                    where: { id },
                    data
                });
            }
            catch (error) {
                logger_1.logger.error(`Error updating company: ${error.message}`);
                throw error;
            }
        });
    }
    /**
     * Delete company by ID
     */
    deleteCompany(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.logger.info(`Deleting company ${id}`);
                return yield database_1.default.company.delete({
                    where: { id }
                });
            }
            catch (error) {
                logger_1.logger.error(`Error deleting company: ${error.message}`);
                throw error;
            }
        });
    }
}
exports.CompanyService = CompanyService;
