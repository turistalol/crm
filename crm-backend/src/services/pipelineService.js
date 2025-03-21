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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../utils/db");
class PipelineService {
    constructor() {
        this.prisma = db_1.db;
    }
    findAll(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.pipeline.findMany({
                where: { teamId },
                include: {
                    stages: {
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.pipeline.findUnique({
                where: { id },
                include: {
                    stages: {
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { initialStages } = data, pipelineData = __rest(data, ["initialStages"]);
            // Create pipeline with transaction to ensure all stages are created
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const pipeline = yield tx.pipeline.create({
                    data: pipelineData,
                });
                // Create default stages if no initialStages provided
                if (!initialStages || initialStages.length === 0) {
                    const defaultStages = [
                        { name: 'New', description: 'New leads', color: '#4299E1', order: 0 },
                        { name: 'Qualified', description: 'Qualified leads', color: '#48BB78', order: 1 },
                        { name: 'Meeting', description: 'Scheduled meetings', color: '#ECC94B', order: 2 },
                        { name: 'Proposal', description: 'Proposal sent', color: '#ED8936', order: 3 },
                        { name: 'Won', description: 'Closed deals', color: '#38A169', order: 4 },
                    ];
                    yield Promise.all(defaultStages.map((stage) => tx.stage.create({
                        data: Object.assign(Object.assign({}, stage), { pipelineId: pipeline.id }),
                    })));
                }
                else {
                    yield Promise.all(initialStages.map((stage) => tx.stage.create({
                        data: Object.assign(Object.assign({}, stage), { pipelineId: pipeline.id }),
                    })));
                }
                return tx.pipeline.findUnique({
                    where: { id: pipeline.id },
                    include: {
                        stages: {
                            orderBy: { order: 'asc' },
                        },
                    },
                });
            }));
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.pipeline.update({
                where: { id },
                data,
                include: {
                    stages: {
                        orderBy: { order: 'asc' },
                    },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.pipeline.delete({
                where: { id },
            });
        });
    }
    // Stage management methods
    createStage(pipelineId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.stage.create({
                data: Object.assign(Object.assign({}, data), { pipelineId }),
            });
        });
    }
    updateStage(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.stage.update({
                where: { id },
                data,
            });
        });
    }
    deleteStage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.stage.delete({
                where: { id },
            });
        });
    }
    reorderStages(pipelineId, stageIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a transaction to ensure all stages are updated atomically
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const stages = yield Promise.all(stageIds.map((stageId, index) => tx.stage.update({
                    where: { id: stageId },
                    data: { order: index },
                })));
                return stages;
            }));
        });
    }
}
exports.default = new PipelineService();
