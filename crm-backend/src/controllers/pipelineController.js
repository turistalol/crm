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
exports.reorderStages = exports.deleteStage = exports.updateStage = exports.createStage = exports.deletePipeline = exports.updatePipeline = exports.createPipeline = exports.getPipeline = exports.getPipelines = void 0;
const pipelineService_1 = __importDefault(require("../services/pipelineService"));
const getPipelines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teamId = req.params.teamId;
        const pipelines = yield pipelineService_1.default.findAll(teamId);
        return res.status(200).json(pipelines);
    }
    catch (error) {
        console.error('Error getting pipelines:', error);
        return res.status(500).json({ message: 'Failed to get pipelines', error });
    }
});
exports.getPipelines = getPipelines;
const getPipeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineId = req.params.id;
        const pipeline = yield pipelineService_1.default.findById(pipelineId);
        if (!pipeline) {
            return res.status(404).json({ message: 'Pipeline not found' });
        }
        return res.status(200).json(pipeline);
    }
    catch (error) {
        console.error('Error getting pipeline:', error);
        return res.status(500).json({ message: 'Failed to get pipeline', error });
    }
});
exports.getPipeline = getPipeline;
const createPipeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineData = req.body;
        const pipeline = yield pipelineService_1.default.create(pipelineData);
        return res.status(201).json(pipeline);
    }
    catch (error) {
        console.error('Error creating pipeline:', error);
        return res.status(500).json({ message: 'Failed to create pipeline', error });
    }
});
exports.createPipeline = createPipeline;
const updatePipeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineId = req.params.id;
        const pipelineData = req.body;
        const pipeline = yield pipelineService_1.default.update(pipelineId, pipelineData);
        return res.status(200).json(pipeline);
    }
    catch (error) {
        console.error('Error updating pipeline:', error);
        return res.status(500).json({ message: 'Failed to update pipeline', error });
    }
});
exports.updatePipeline = updatePipeline;
const deletePipeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineId = req.params.id;
        yield pipelineService_1.default.delete(pipelineId);
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting pipeline:', error);
        return res.status(500).json({ message: 'Failed to delete pipeline', error });
    }
});
exports.deletePipeline = deletePipeline;
const createStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineId = req.params.pipelineId;
        const stageData = req.body;
        const stage = yield pipelineService_1.default.createStage(pipelineId, stageData);
        return res.status(201).json(stage);
    }
    catch (error) {
        console.error('Error creating stage:', error);
        return res.status(500).json({ message: 'Failed to create stage', error });
    }
});
exports.createStage = createStage;
const updateStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stageId = req.params.id;
        const stageData = req.body;
        const stage = yield pipelineService_1.default.updateStage(stageId, stageData);
        return res.status(200).json(stage);
    }
    catch (error) {
        console.error('Error updating stage:', error);
        return res.status(500).json({ message: 'Failed to update stage', error });
    }
});
exports.updateStage = updateStage;
const deleteStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stageId = req.params.id;
        yield pipelineService_1.default.deleteStage(stageId);
        return res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting stage:', error);
        return res.status(500).json({ message: 'Failed to delete stage', error });
    }
});
exports.deleteStage = deleteStage;
const reorderStages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipelineId = req.params.pipelineId;
        const { stageIds } = req.body;
        const stages = yield pipelineService_1.default.reorderStages(pipelineId, stageIds);
        return res.status(200).json(stages);
    }
    catch (error) {
        console.error('Error reordering stages:', error);
        return res.status(500).json({ message: 'Failed to reorder stages', error });
    }
});
exports.reorderStages = reorderStages;
