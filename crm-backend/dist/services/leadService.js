import { PrismaClient, Lead, LeadStatus } from '@prisma/client';
import prisma from '../utils/database';

interface CreateLeadInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  notes?: string;
  pipelineId: string;
  stageId: string;
  assignedToId?: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

interface UpdateLeadInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  status?: LeadStatus;
  notes?: string;
  stageId?: string;
  assignedToId?: string | null;
  customFields?: Record<string, any>;
}

interface LeadFilter {
  pipelineId?: string;
  stageId?: string;
  assignedToId?: string;
  status?: LeadStatus;
  search?: string;
  minValue?: number;
  maxValue?: number;
}

class LeadService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async findAll(filters: LeadFilter): Promise<Lead[]> {
    const {
      pipelineId,
      stageId,
      assignedToId,
      status,
      search,
      minValue,
      maxValue,
    } = filters;

    const where: any = {};

    if (pipelineId) where.pipelineId = pipelineId;
    if (stageId) where.stageId = stageId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minValue !== undefined || maxValue !== undefined) {
      where.value = {};
      if (minValue !== undefined) where.value.gte = minValue;
      if (maxValue !== undefined) where.value.lte = maxValue;
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
  }

  async findById(id: string): Promise<Lead | null> {
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
  }

  async create(data: CreateLeadInput): Promise<Lead> {
    const { tags, ...leadData } = data;

    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          ...leadData,
          status: LeadStatus.ACTIVE,
        },
      });

      if (tags && tags.length > 0) {
        // Connect existing tags or create new ones
        await Promise.all(
          tags.map(async (tagName) => {
            // Check if tag exists
            let tag = await tx.leadTag.findFirst({
              where: { name: { equals: tagName, mode: 'insensitive' } },
            });

            // Create tag if it doesn't exist
            if (!tag) {
              tag = await tx.leadTag.create({
                data: {
                  name: tagName,
                  // Generate a random color for the tag
                  color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                },
              });
            }

            // Connect tag to lead
            await tx.lead.update({
              where: { id: lead.id },
              data: {
                tags: {
                  connect: { id: tag.id },
                },
              },
            });
          })
        );
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
      }) as Promise<Lead>;
    });
  }

  async update(id: string, data: UpdateLeadInput): Promise<Lead> {
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
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lead.delete({
      where: { id },
    });
  }

  async moveToStage(id: string, stageId: string): Promise<Lead> {
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
  }

  async addTag(leadId: string, tagName: string): Promise<Lead> {
    return this.prisma.$transaction(async (tx) => {
      // Check if tag exists
      let tag = await tx.leadTag.findFirst({
        where: { name: { equals: tagName, mode: 'insensitive' } },
      });

      // Create tag if it doesn't exist
      if (!tag) {
        tag = await tx.leadTag.create({
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
    });
  }

  async removeTag(leadId: string, tagId: string): Promise<Lead> {
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
  }

  // Bulk update leads
  async bulkUpdateLeads(
    leadIds: string[],
    updates: {
      stageId?: string;
      status?: LeadStatus;
      value?: number;
      assignedToId?: string | null;
      tags?: string[];
    }
  ) {
    try {
      this.logger.info(`Bulk updating ${leadIds.length} leads`);
      
      // If tags is provided, handle tags separately
      const tagsToUpdate = updates.tags;
      delete updates.tags;
      
      // Update all leads with the provided updates
      const updatePromises = leadIds.map(async (leadId) => {
        // Base update operation for each lead
        let updateOperation = this.prisma.lead.update({
          where: { id: leadId },
          data: { ...updates },
        });
        
        // If we're updating to a new stage, record the activity
        if (updates.stageId) {
          await this.prisma.leadActivity.create({
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
          await this.prisma.leadActivity.create({
            data: {
              leadId,
              type: 'STATUS_CHANGE',
              description: `Lead status changed to ${updates.status}`,
              data: { newStatus: updates.status },
            },
          });
        }
        
        return updateOperation;
      });
      
      // Execute all updates in parallel
      const results = await Promise.all(updatePromises);
      
      // If tags were provided, handle tag updates for each lead
      if (tagsToUpdate && tagsToUpdate.length > 0) {
        // For each lead, clear existing tags and add the new ones
        const tagPromises = leadIds.map(async (leadId) => {
          // Clear existing tags
          await this.prisma.leadTag.deleteMany({
            where: { leadId },
          });
          
          // Add new tags
          const tagCreatePromises = tagsToUpdate.map(tagName => 
            this.prisma.leadTag.create({
              data: {
                name: tagName,
                leadId,
              },
            })
          );
          
          return Promise.all(tagCreatePromises);
        });
        
        await Promise.all(tagPromises);
        
        // Record tag activity
        const tagActivityPromises = leadIds.map(leadId => 
          this.prisma.leadActivity.create({
            data: {
              leadId,
              type: 'TAGS_UPDATED',
              description: `Tags updated via bulk operation`,
              data: { tags: tagsToUpdate },
            },
          })
        );
        
        await Promise.all(tagActivityPromises);
      }
      
      return {
        message: `Successfully updated ${results.length} leads`,
        count: results.length,
      };
    } catch (error) {
      this.logger.error(`Error in bulk update leads: ${error.message}`, error);
      throw error;
    }
  }
}

export default new LeadService(); 