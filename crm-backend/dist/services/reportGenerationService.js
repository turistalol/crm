import prisma from '../utils/database';
import { logger } from '../utils/logger';
import { ReportType } from '@prisma/client';
import { formatYYYYMMDD, getDateRangeFromPeriod } from '../utils/dateUtils';

// Define report data interfaces
export interface ConversionRate {
  fromStage: string;
  toStage: string;
  rate: number;
}

export interface StageTime {
  stage: string;
  averageTime: number;  // in milliseconds
}

export interface LeadValueByStage {
  stage: string;
  totalValue: number;
  count: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  newLeads: number;
  convertedLeads: number;
  totalValue: number;
}

export interface TeamPerformanceMember {
  id: string;
  name: string;
  leadsGenerated: number;
  convertedLeads: number;
  conversionRate: number;
  value: number;
}

export interface LeadSourceData {
  source: string;
  count: number;
  convertedCount: number;
  conversionRate: number;
  totalValue: number;
  avgValue: number;
}

export interface ReportData {
  // Pipeline Performance
  conversionRates?: ConversionRate[];
  stageTimes?: StageTime[];
  leadValuesByStage?: LeadValueByStage[];
  timeSeriesData?: TimeSeriesDataPoint[];
  
  // Team Performance
  teamPerformance?: TeamPerformanceMember[];
  
  // Lead Analysis
  leadsBySource?: LeadSourceData[];
  leadsByTag?: { tag: string; count: number }[];
  
  // General
  startDate: string;
  endDate: string;
}

/**
 * Generate report content based on report type and filters
 */
export async function generateReportContent(
  reportType: ReportType,
  filters: any
): Promise<ReportData> {
  try {
    logger.info(`Generating ${reportType} report with filters: ${JSON.stringify(filters)}`);
    
    // Get date range from filters
    const { startDate, endDate } = getDateRangeFromPeriod(
      filters.period || 'last30days',
      filters.startDate,
      filters.endDate
    );
    
    // Base report data with date range
    const reportData: ReportData = {
      startDate: formatYYYYMMDD(startDate),
      endDate: formatYYYYMMDD(endDate),
    };
    
    // Generate specific report data based on report type
    switch (reportType) {
      case ReportType.PIPELINE_PERFORMANCE:
        return await generatePipelinePerformanceReport(reportData, filters, startDate, endDate);
      
      case ReportType.TEAM_PERFORMANCE:
        return await generateTeamPerformanceReport(reportData, filters, startDate, endDate);
      
      case ReportType.LEAD_ANALYSIS:
        return await generateLeadAnalysisReport(reportData, filters, startDate, endDate);
      
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  } catch (error) {
    logger.error(`Error generating report: ${error.message}`);
    throw error;
  }
}

/**
 * Generate Pipeline Performance Report
 */
async function generatePipelinePerformanceReport(
  baseData: ReportData,
  filters: any,
  startDate: Date,
  endDate: Date
): Promise<ReportData> {
  const { pipelineId } = filters;
  
  if (!pipelineId) {
    throw new Error('Pipeline ID is required for pipeline performance report');
  }
  
  // Get pipeline details
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    include: {
      stages: {
        orderBy: { position: 'asc' },
      },
    },
  });
  
  if (!pipeline) {
    throw new Error(`Pipeline with ID ${pipelineId} not found`);
  }
  
  // Get leads in this pipeline within date range
  const leads = await prisma.lead.findMany({
    where: {
      pipelineId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      LeadActivity: {
        where: {
          type: 'STAGE_CHANGE',
          createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  
  // Calculate conversion rates between stages
  baseData.conversionRates = calculateConversionRates(pipeline.stages, leads);
  
  // Calculate average time in each stage
  baseData.stageTimes = calculateStageTimes(pipeline.stages, leads);
  
  // Calculate lead values by stage
  baseData.leadValuesByStage = calculateLeadValuesByStage(pipeline.stages, leads);
  
  // Generate time series data
  baseData.timeSeriesData = await calculateTimeSeriesData(pipelineId, startDate, endDate);
  
  return baseData;
}

/**
 * Generate Team Performance Report
 */
async function generateTeamPerformanceReport(
  baseData: ReportData,
  filters: any,
  startDate: Date,
  endDate: Date
): Promise<ReportData> {
  const { teamId } = filters;
  
  if (!teamId) {
    throw new Error('Team ID is required for team performance report');
  }
  
  // Get team members
  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: true,
    },
  });
  
  // Performance data for each team member
  const performanceData: TeamPerformanceMember[] = [];
  
  for (const member of teamMembers) {
    // Count leads assigned to this member in date range
    const leadsGenerated = await prisma.lead.count({
      where: {
        assignedToId: member.userId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });
    
    // Count converted leads
    const convertedLeads = await prisma.lead.count({
      where: {
        assignedToId: member.userId,
        status: 'WON',
        updatedAt: { gte: startDate, lte: endDate },
      },
    });
    
    // Calculate total value of won deals
    const dealsValue = await prisma.lead.aggregate({
      where: {
        assignedToId: member.userId,
        status: 'WON',
        updatedAt: { gte: startDate, lte: endDate },
      },
      _sum: { value: true },
    });
    
    performanceData.push({
      id: member.userId,
      name: member.user.name,
      leadsGenerated,
      convertedLeads,
      conversionRate: leadsGenerated > 0 ? convertedLeads / leadsGenerated : 0,
      value: dealsValue._sum.value || 0,
    });
  }
  
  baseData.teamPerformance = performanceData;
  
  return baseData;
}

/**
 * Generate Lead Analysis Report
 */
async function generateLeadAnalysisReport(
  baseData: ReportData,
  filters: any,
  startDate: Date,
  endDate: Date
): Promise<ReportData> {
  // Get leads created in date range
  const leads = await prisma.lead.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      tags: true,
    },
  });
  
  // Analyze leads by source
  const sourceMap = new Map<string, {
    count: number;
    convertedCount: number;
    totalValue: number;
  }>();
  
  // Analyze leads by tag
  const tagMap = new Map<string, number>();
  
  // Process each lead
  leads.forEach(lead => {
    // Process source
    const source = lead.source || 'Unknown';
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { count: 0, convertedCount: 0, totalValue: 0 });
    }
    
    const sourceData = sourceMap.get(source)!;
    sourceData.count++;
    
    if (lead.status === 'WON') {
      sourceData.convertedCount++;
      sourceData.totalValue += lead.value || 0;
    }
    
    // Process tags
    lead.tags.forEach(tag => {
      const tagCount = tagMap.get(tag.name) || 0;
      tagMap.set(tag.name, tagCount + 1);
    });
  });
  
  // Convert source map to array and calculate derived metrics
  baseData.leadsBySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    count: data.count,
    convertedCount: data.convertedCount,
    conversionRate: data.count > 0 ? data.convertedCount / data.count : 0,
    totalValue: data.totalValue,
    avgValue: data.convertedCount > 0 ? data.totalValue / data.convertedCount : 0,
  }));
  
  // Convert tag map to array
  baseData.leadsByTag = Array.from(tagMap.entries()).map(([tag, count]) => ({
    tag,
    count,
  }));
  
  return baseData;
}

/**
 * Calculate conversion rates between pipeline stages
 */
function calculateConversionRates(stages: any[], leads: any[]): ConversionRate[] {
  const conversionRates: ConversionRate[] = [];
  
  // Count leads in each stage
  const stageLeadCounts = new Map<string, number>();
  stages.forEach(stage => {
    const leadsInStage = leads.filter(lead => lead.stageId === stage.id);
    stageLeadCounts.set(stage.id, leadsInStage.length);
  });
  
  // Calculate conversion rates between adjacent stages
  for (let i = 0; i < stages.length - 1; i++) {
    const fromStage = stages[i];
    const toStage = stages[i + 1];
    
    const fromCount = stageLeadCounts.get(fromStage.id) || 0;
    const toCount = stageLeadCounts.get(toStage.id) || 0;
    
    // Calculate rate, avoiding division by zero
    const rate = fromCount > 0 ? toCount / fromCount : 0;
    
    conversionRates.push({
      fromStage: fromStage.name,
      toStage: toStage.name,
      rate,
    });
  }
  
  return conversionRates;
}

/**
 * Calculate average time spent in each stage
 */
function calculateStageTimes(stages: any[], leads: any[]): StageTime[] {
  const stageTimes: StageTime[] = [];
  
  stages.forEach(stage => {
    let totalTime = 0;
    let leadCount = 0;
    
    leads.forEach(lead => {
      // Find stage changes for this lead
      const activities = lead.LeadActivity || [];
      
      // Find entry and exit times for this stage
      let entryTime: Date | null = null;
      let exitTime: Date | null = null;
      
      activities.forEach(activity => {
        if (activity.data.toStageId === stage.id) {
          entryTime = new Date(activity.createdAt);
        } else if (activity.data.fromStageId === stage.id) {
          exitTime = new Date(activity.createdAt);
        }
      });
      
      // If lead is currently in this stage, use current time as exit
      if (entryTime && !exitTime && lead.stageId === stage.id) {
        exitTime = new Date();
      }
      
      // Calculate time in stage if we have both entry and exit times
      if (entryTime && exitTime) {
        const timeInStage = exitTime.getTime() - entryTime.getTime();
        totalTime += timeInStage;
        leadCount++;
      }
    });
    
    // Calculate average time (in milliseconds)
    const averageTime = leadCount > 0 ? totalTime / leadCount : 0;
    
    stageTimes.push({
      stage: stage.name,
      averageTime,
    });
  });
  
  return stageTimes;
}

/**
 * Calculate lead values by stage
 */
function calculateLeadValuesByStage(stages: any[], leads: any[]): LeadValueByStage[] {
  const leadValuesByStage: LeadValueByStage[] = [];
  
  stages.forEach(stage => {
    const leadsInStage = leads.filter(lead => lead.stageId === stage.id);
    const totalValue = leadsInStage.reduce((sum, lead) => sum + (lead.value || 0), 0);
    
    leadValuesByStage.push({
      stage: stage.name,
      totalValue,
      count: leadsInStage.length,
    });
  });
  
  return leadValuesByStage;
}

/**
 * Calculate time series data for pipeline metrics
 */
async function calculateTimeSeriesData(
  pipelineId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesDataPoint[]> {
  // Generate array of dates between start and end
  const timeSeriesData: TimeSeriesDataPoint[] = [];
  
  // Generate for each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Count new leads for this day
    const newLeads = await prisma.lead.count({
      where: {
        pipelineId,
        createdAt: { gte: dayStart, lte: dayEnd },
      },
    });
    
    // Count leads that were won on this day
    const convertedLeads = await prisma.lead.count({
      where: {
        pipelineId,
        status: 'WON',
        updatedAt: { gte: dayStart, lte: dayEnd },
      },
    });
    
    // Sum value of won leads on this day
    const wonLeadsValue = await prisma.lead.aggregate({
      where: {
        pipelineId,
        status: 'WON',
        updatedAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { value: true },
    });
    
    timeSeriesData.push({
      date: formatYYYYMMDD(currentDate),
      newLeads,
      convertedLeads,
      totalValue: wonLeadsValue._sum.value || 0,
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return timeSeriesData;
} 