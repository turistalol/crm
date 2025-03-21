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
const client_1 = require("@prisma/client");
const db_1 = require("../utils/db");
class LeadService {
    constructor() {
        this.prisma = db_1.db;
    }
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pipelineId, stageId, assignedToId, status, search, minValue, maxValue, } = filters;
            const where = {};
            if (pipelineId)
                where.pipelineId = pipelineId;
            if (stageId)
                where.stageId = stageId;
            if (assignedToId)
                where.assignedToId = assignedToId;
            if (status)
                where.status = status;
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { company: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (minValue !== undefined || maxValue !== undefined) {
                where.value = {};
                if (minValue !== undefined)
                    where.value.gte = minValue;
                if (maxValue !== undefined)
                    where.value.lte = maxValue;
            }
            return this.prisma.lead.findMany({
                where,
                include: {
                    stage: true,
                    assignedTo: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    tags: true,
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.lead.findUnique({
                where: { id },
                include: {
                    stage: true,
                    assignedTo: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    tags: true,
                },
            });
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tags } = data, leadData = __rest(data, ["tags"]);
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const lead = yield tx.lead.create({
                    data: Object.assign(Object.assign({}, leadData), { status: client_1.LeadStatus.ACTIVE }),
                });
                if (tags && tags.length > 0) {
                    // Connect existing tags or create new ones
                    yield Promise.all(tags.map((tagName) => __awaiter(this, void 0, void 0, function* () {
                        // Check if tag exists
                        let tag = yield tx.leadTag.findFirst({
                            where: { name: { equals: tagName, mode: 'insensitive' } },
                        });
                        // Create tag if it doesn't exist
                        if (!tag) {
                            tag = yield tx.leadTag.create({
                                data: {
                                    name: tagName,
                                    // Generate a random color for the tag
                                    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                                },
                            });
                        }
                        // Connect tag to lead
                        yield tx.lead.update({
                            where: { id: lead.id },
                            data: {
                                tags: {
                                    connect: { id: tag.id },
                                },
                            },
                        });
                    })));
                }
                return tx.lead.findUnique({
                    where: { id: lead.id },
                    include: {
                        stage: true,
                        assignedTo: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        tags: true,
                    },
                });
            }));
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.lead.update({
                where: { id },
                data,
                include: {
                    stage: true,
                    assignedTo: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    tags: true,
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.lead.delete({
                where: { id },
            });
        });
    }
    moveToStage(id, stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.lead.update({
                where: { id },
                data: { stageId },
                include: {
                    stage: true,
                    assignedTo: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    tags: true,
                },
            });
        });
    }
    addTag(leadId, tagName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Check if tag exists
                let tag = yield tx.leadTag.findFirst({
                    where: { name: { equals: tagName, mode: 'insensitive' } },
                });
                // Create tag if it doesn't exist
                if (!tag) {
                    tag = yield tx.leadTag.create({
                        data: {
                            name: tagName,
                            // Generate a random color for the tag
                            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                        },
                    });
                }
                // Connect tag to lead
                return tx.lead.update({
                    where: { id: leadId },
                    data: {
                        tags: {
                            connect: { id: tag.id },
                        },
                    },
                    include: {
                        stage: true,
                        assignedTo: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        tags: true,
                    },
                });
            }));
        });
    }
    removeTag(leadId, tagId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.lead.update({
                where: { id: leadId },
                data: {
                    tags: {
                        disconnect: { id: tagId },
                    },
                },
                include: {
                    stage: true,
                    assignedTo: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    tags: true,
                },
            });
        });
    }
    // Bulk update leads
    bulkUpdateLeads(leadIds, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger.info(`Bulk updating ${leadIds.length} leads`);
                // If tags is provided, handle tags separately
                const tagsToUpdate = updates.tags;
                delete updates.tags;
                // Update all leads with the provided updates
                const updatePromises = leadIds.map((leadId) => __awaiter(this, void 0, void 0, function* () {
                    // Base update operation for each lead
                    let updateOperation = this.prisma.lead.update({
                        where: { id: leadId },
                        data: Object.assign({}, updates),
                    });
                    // If we're updating to a new stage, record the activity
                    if (updates.stageId) {
                        yield this.prisma.leadActivity.create({
                            data: {
                                leadId,
                                type: 'STAGE_CHANGE',
                                description: `Lead moved to new stage`,
                                data: { newStageId: updates.stageId },
                            },
                        });
                    }
                    // If we're updating the status, record the activity
                    if (updates.status) {
                        yield this.prisma.leadActivity.create({
                            data: {
                                leadId,
                                type: 'STATUS_CHANGE',
                                description: `Lead status changed to ${updates.status}`,
                                data: { newStatus: updates.status },
                            },
                        });
                    }
                    return updateOperation;
                }));
                // Execute all updates in parallel
                const results = yield Promise.all(updatePromises);
                // If tags were provided, handle tag updates for each lead
                if (tagsToUpdate && tagsToUpdate.length > 0) {
                    // For each lead, clear existing tags and add the new ones
                    const tagPromises = leadIds.map((leadId) => __awaiter(this, void 0, void 0, function* () {
                        // Clear existing tags
                        yield this.prisma.leadTag.deleteMany({
                            where: { leadId },
                        });
                        // Add new tags
                        const tagCreatePromises = tagsToUpdate.map(tagName => this.prisma.leadTag.create({
                            data: {
                                name: tagName,
                                leadId,
                            },
                        }));
                        return Promise.all(tagCreatePromises);
                    }));
                    yield Promise.all(tagPromises);
                    // Record tag activity
                    const tagActivityPromises = leadIds.map(leadId => this.prisma.leadActivity.create({
                        data: {
                            leadId,
                            type: 'TAGS_UPDATED',
                            description: `Tags updated via bulk operation`,
                            data: { tags: tagsToUpdate },
                        },
                    }));
                    yield Promise.all(tagActivityPromises);
                }
                return {
                    message: `Successfully updated ${results.length} leads`,
                    count: results.length,
                };
            }
            catch (error) {
                this.logger.error(`Error in bulk update leads: ${error.message}`, error);
                throw error;
            }
        });
    }
}
exports.default = new LeadService();
