import { PrismaClient, Pipeline, Stage } from '@prisma/client';
import prisma from '../utils/database';

interface CreatePipelineInput {
  name: string;
  description?: string;
  teamId: string;
  initialStages?: Array<{
    name: string;
    description?: string;
    color?: string;
    order: number;
  }>;
}

interface UpdatePipelineInput {
  name?: string;
  description?: string;
}

class PipelineService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async findAll(teamId: string): Promise<Pipeline[]> {
    return this.prisma.pipeline.findMany({
      where: { teamId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findById(id: string): Promise<Pipeline | null> {
    return this.prisma.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async create(data: CreatePipelineInput): Promise<Pipeline> {
    const { initialStages, ...pipelineData } = data;

    // Create pipeline with transaction to ensure all stages are created
    return this.prisma.$transaction(async (tx) => {
      const pipeline = await tx.pipeline.create({
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

        await Promise.all(
          defaultStages.map((stage) =>
            tx.stage.create({
              data: {
                ...stage,
                pipelineId: pipeline.id,
              },
            })
          )
        );
      } else {
        await Promise.all(
          initialStages.map((stage) =>
            tx.stage.create({
              data: {
                ...stage,
                pipelineId: pipeline.id,
              },
            })
          )
        );
      }

      return tx.pipeline.findUnique({
        where: { id: pipeline.id },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
        },
      }) as Promise<Pipeline>;
    });
  }

  async update(id: string, data: UpdatePipelineInput): Promise<Pipeline> {
    return this.prisma.pipeline.update({
      where: { id },
      data,
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pipeline.delete({
      where: { id },
    });
  }

  // Stage management methods
  async createStage(pipelineId: string, data: Omit<Stage, 'id' | 'createdAt' | 'updatedAt' | 'pipelineId'>): Promise<Stage> {
    return this.prisma.stage.create({
      data: {
        ...data,
        pipelineId,
      },
    });
  }

  async updateStage(id: string, data: Partial<Omit<Stage, 'id' | 'createdAt' | 'updatedAt' | 'pipelineId'>>): Promise<Stage> {
    return this.prisma.stage.update({
      where: { id },
      data,
    });
  }

  async deleteStage(id: string): Promise<void> {
    await this.prisma.stage.delete({
      where: { id },
    });
  }

  async reorderStages(pipelineId: string, stageIds: string[]): Promise<Stage[]> {
    // Create a transaction to ensure all stages are updated atomically
    return this.prisma.$transaction(async (tx) => {
      const stages = await Promise.all(
        stageIds.map((stageId, index) =>
          tx.stage.update({
            where: { id: stageId },
            data: { order: index },
          })
        )
      );
      return stages;
    });
  }
}

export default new PipelineService(); 