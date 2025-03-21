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
exports.bulkUpdateLeads = exports.removeTagFromLead = exports.addTagToLead = exports.moveLeadToStage = exports.deleteLead = exports.updateLead = exports.createLead = exports.getLead = exports.getLeads = void 0;
const leadService_1 = __importDefault(require("../services/leadService"));
const getLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pipelineId, stageId, assignedToId, status, search, minValue, maxValue, } = req.query;
        const filters = {};
        if (pipelineId)
            filters.pipelineId = pipelineId;
        if (stageId)
            filters.stageId = stageId;
        if (assignedToId)
            filters.assignedToId = assignedToId;
        if (status)
            filters.status = status;
        if (search)
            filters.search = search;
        if (minValue)
            filters.minValue = parseFloat(minValue);
        if (maxValue)
            filters.maxValue = parseFloat(maxValue);
        const leads = yield leadService_1.default.findAll(filters);
        return res.status(200).json(leads);
    }
    catch (error) {
        console.error('Error getting leads:', error);
        return res.status(500).json({ message: 'Failed to get leads', error });
    }
});
exports.getLeads = getLeads;
const getLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadId = req.params.id;
        const lead = yield leadService_1.default.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        return res.status(200).json(lead);
    }
    catch (error) {
        console.error('Error getting lead:', error);
        return res.status(500).json({ message: 'Failed to get lead', error });
    }
});
exports.getLead = getLead;
const createLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadData = req.body;
        const lead = yield leadService_1.default.create(leadData);
        return res.status(201).json(lead);
    }
    catch (error) {
        console.error('Error creating lead:', error);
        return res.status(500).json({ message: 'Failed to create lead', error });
    }
});
exports.createLead = createLead;
const updateLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadId = req.params.id;
        const leadData = req.body;
        const lead = yield leadService_1.default.update(leadId, leadData);
        return res.status(200).json(lead);
    }
    catch (error) {
        console.error('Error updating lead:', error);
        return res.status(500).json({ message: 'Failed to update lead', error });
    }
});
exports.updateLead = updateLead;
const deleteLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadId = req.params.id;
        yield leadService_1.default.delete(leadId);
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting lead:', error);
        return res.status(500).json({ message: 'Failed to delete lead', error });
    }
});
exports.deleteLead = deleteLead;
const moveLeadToStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadId = req.params.id;
        const { stageId } = req.body;
        const lead = yield leadService_1.default.moveToStage(leadId, stageId);
        return res.status(200).json(lead);
    }
    catch (error) {
        console.error('Error moving lead to stage:', error);
        return res.status(500).json({ message: 'Failed to move lead to stage', error });
    }
});
exports.moveLeadToStage = moveLeadToStage;
const addTagToLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadId = req.params.id;
        const { tagName } = req.body;
        const lead = yield leadService_1.default.addTag(leadId, tagName);
        return res.status(200).json(lead);
    }
    catch (error) {
        console.error('Error adding tag to lead:', error);
        return res.status(500).json({ message: 'Failed to add tag to lead', error });
    }
});
exports.addTagToLead = addTagToLead;
const removeTagFromLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadId = req.params.id;
        const { tagId } = req.params;
        const lead = yield leadService_1.default.removeTag(leadId, tagId);
        return res.status(200).json(lead);
    }
    catch (error) {
        console.error('Error removing tag from lead:', error);
        return res.status(500).json({ message: 'Failed to remove tag from lead', error });
    }
});
exports.removeTagFromLead = removeTagFromLead;
// Bulk update leads
const bulkUpdateLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leadIds, updates } = req.body;
        // Validate the input
        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ message: 'leadIds must be a non-empty array' });
        }
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }
        // Process bulk update
        const result = yield leadService_1.default.bulkUpdateLeads(leadIds, updates);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.bulkUpdateLeads = bulkUpdateLeads;
