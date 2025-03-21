import { PrismaClient } from '@prisma/client';
import { CreateReportDto, UpdateReportDto, PipelineMetrics, TeamPerformanceMetrics } from '../models/apiTypes';
import prisma from '../utils/database';
import { logger } from '../utils/logger';
import cacheService from './cacheService';
import nodemailer from 'nodemailer';
import { formatDateRange, getDateRangeFromPeriod } from '../utils/dateUtils';
import { generateReportContent, ReportData } from './reportGenerationService';
import Bull from 'bull';
import Redis from 'ioredis';

// Create Redis client for caching
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redisUrl);

// Configure email transporter
const emailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Initialize Bull queue for report generation
const reportQueue = new Bull('report-generation', redisUrl);

export class ReportService {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  // Generate report cache key
  private generateReportCacheKey(type: string, id: string, params?: Record<string, any>): string {
    const baseKey = `report:${type}:${id}`;
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    
    const paramsStr = JSON.stringify(params);
    return `${baseKey}:${Buffer.from(paramsStr).toString('base64')}`;
  }

  async createReport(data: CreateReportDto) {
    try {
      const report = await this.db.report.create({
        data: {
          name: data.name,
          type: data.type,
          filters: data.filters,
          company: {
            connect: { id: data.companyId }
          },
          createdBy: {
            connect: { id: data.createdById }
          }
        }
      });
      
      // Invalidate cache for this company's reports
      await cacheService.deleteByPattern(`report:company:${data.companyId}:*`);
      
      return report;
    } catch (error) {
      logger.error('Error creating report:', error);
      throw error;
    }
  }

  async getReports(companyId: string) {
    try {
      // Generate cache key
      const cacheKey = `report:company:${companyId}:all`;
      
      // Try to get from cache first
      const cachedData = await cacheService.get<any[]>(cacheKey);
      if (cachedData) {
        logger.debug(`Retrieved reports for company ${companyId} from cache`);
        return cachedData;
      }
      
      // If not in cache, fetch from database
      const reports = await this.db.report.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Store in cache
      await cacheService.set(cacheKey, reports);
      
      return reports;
    } catch (error) {
      logger.error('Error fetching reports:', error);
      throw error;
    }
  }

  async getReportById(id: string) {
    try {
      // Try to get from cache first
      const cacheKey = `report:detail:${id}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.debug(`Retrieved report ${id} from cache`);
        return cachedData;
      }
      
      const report = await this.db.report.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      if (report) {
        // Store in cache
        await cacheService.set(cacheKey, report);
      }
      
      return report;
    } catch (error) {
      logger.error(`Error fetching report with id ${id}:`, error);
      throw error;
    }
  }

  async updateReport(id: string, data: UpdateReportDto) {
    try {
      const report = await this.db.report.update({
        where: { id },
        data,
        include: { company: true }
      });
      
      // Invalidate cache for this report and company reports
      await cacheService.delete(`report:detail:${id}`);
      await cacheService.deleteByPattern(`report:company:${report.companyId}:*`);
      
      return report;
    } catch (error) {
      logger.error(`Error updating report with id ${id}:`, error);
      throw error;
    }
  }

  async deleteReport(id: string) {
    try {
      // Get company ID before deleting
      const report = await this.db.report.findUnique({
        where: { id },
        select: { companyId: true }
      });
      
      const result = await this.db.report.delete({
        where: { id }
      });
      
      // Invalidate cache
      await cacheService.delete(`report:detail:${id}`);
      if (report) {
        await cacheService.deleteByPattern(`report:company:${report.companyId}:*`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error deleting report with id ${id}:`, error);
      throw error;
    }
  }

  // Generate pipeline performance metrics
  async getPipelineMetrics(pipelineId: string, dateRange?: { start: Date; end: Date }) {
    try {
      // Generate cache key
      const cacheKey = this.generateReportCacheKey('pipeline', pipelineId, { dateRange });
      
      // Try to get from cache first
      const cachedData = await cacheService.get<PipelineMetrics>(cacheKey);
      if (cachedData) {
        logger.debug(`Retrieved pipeline metrics for ${pipelineId} from cache`);
        return cachedData;
      }
      
      const whereClause: any = { 
        pipelineId 
      };
      
      if (dateRange) {
        whereClause.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      // Get all leads in the pipeline
      const leads = await this.db.lead.findMany({
        where: whereClause,
        include: {
          stage: true
        }
      });

      // Get won leads
      const wonLeads = leads.filter(lead => lead.status === 'WON');
      
      // Calculate metrics
      const totalLeads = leads.length;
      const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
      const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;
      const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;
      
      // Group leads by stage
      const stageMap = new Map();
      leads.forEach(lead => {
        const stageId = lead.stageId;
        const stageName = lead.stage.name;
        
        if (!stageMap.has(stageId)) {
          stageMap.set(stageId, {
            stageName,
            count: 0,
            value: 0
          });
        }
        
        const stageData = stageMap.get(stageId);
        stageData.count += 1;
        stageData.value += lead.value || 0;
      });
      
      const leadsByStage = Array.from(stageMap.values());
      
      // Get pipeline for calculating average deal time
      const pipeline = await this.db.pipeline.findUnique({
        where: { id: pipelineId },
        include: {
          leads: {
            where: { status: 'WON' },
            select: {
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
      
      // Calculate average time to close a deal (in days)
      let avgDealTime = 0;
      if (pipeline && pipeline.leads.length > 0) {
        const totalDealTime = pipeline.leads.reduce((sum, lead) => {
          const createdDate = new Date(lead.createdAt);
          const closedDate = new Date(lead.updatedAt);
          const timeDiff = closedDate.getTime() - createdDate.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24); // Convert ms to days
          return sum + daysDiff;
        }, 0);
        
        avgDealTime = totalDealTime / pipeline.leads.length;
      }
      
      const metrics: PipelineMetrics = {
        totalLeads,
        leadsByStage,
        conversionRate,
        avgDealSize,
        avgDealTime
      };
      
      // Cache the result (shorter expiration for metrics since they can change frequently)
      await cacheService.set(cacheKey, metrics, 900); // 15 minutes
      
      return metrics;
    } catch (error) {
      logger.error(`Error generating pipeline metrics for ${pipelineId}:`, error);
      throw error;
    }
  }
  
  // Generate team performance metrics
  async getTeamPerformanceMetrics(teamId: string, dateRange?: { start: Date; end: Date }) {
    try {
      // Generate cache key
      const cacheKey = this.generateReportCacheKey('team', teamId, { dateRange });
      
      // Try to get from cache first
      const cachedData = await cacheService.get<TeamPerformanceMetrics>(cacheKey);
      if (cachedData) {
        logger.debug(`Retrieved team performance metrics for ${teamId} from cache`);
        return cachedData;
      }
      
      // Get team with members
      const team = await this.db.team.findUnique({
        where: { id: teamId },
        include: {
          members: {
            include: {
              user: true,
              leads: {
                where: dateRange ? {
                  createdAt: {
                    gte: dateRange.start,
                    lte: dateRange.end
                  }
                } : undefined,
                include: {
                  stage: true
                }
              }
            }
          }
        }
      });
      
      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }
      
      // Calculate overall team metrics
      let totalLeads = 0;
      let totalValue = 0;
      let dealsWon = 0;
      let dealsLost = 0;
      
      const memberPerformance = team.members.map(member => {
        const memberLeads = member.leads;
        const memberDealsWon = memberLeads.filter(lead => lead.status === 'WON');
        const memberTotalValue = memberLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
        
        totalLeads += memberLeads.length;
        totalValue += memberTotalValue;
        dealsWon += memberDealsWon.length;
        dealsLost += memberLeads.filter(lead => lead.status === 'LOST').length;
        
        return {
          memberId: member.id,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
          leadsCount: memberLeads.length,
          dealsWon: memberDealsWon.length,
          totalValue: memberTotalValue
        };
      });
      
      const conversionRate = totalLeads > 0 ? (dealsWon / totalLeads) * 100 : 0;
      
      const metrics: TeamPerformanceMetrics = {
        totalLeads,
        totalValue,
        dealsWon,
        dealsLost,
        conversionRate,
        memberPerformance
      };
      
      // Cache the result (shorter expiration for metrics since they can change frequently)
      await cacheService.set(cacheKey, metrics, 900); // 15 minutes
      
      return metrics;
    } catch (error) {
      logger.error(`Error generating team performance metrics for ${teamId}:`, error);
      throw error;
    }
  }
  
  // Method to invalidate cache when data changes
  async invalidateMetricsCache(pipelineId?: string, teamId?: string) {
    if (pipelineId) {
      await cacheService.deleteByPattern(`report:pipeline:${pipelineId}:*`);
      logger.debug(`Invalidated pipeline metrics cache for ${pipelineId}`);
    }
    
    if (teamId) {
      await cacheService.deleteByPattern(`report:team:${teamId}:*`);
      logger.debug(`Invalidated team metrics cache for ${teamId}`);
    }
  }

  // Create a new report
  async createScheduledReport(data: {
    name: string;
    type: ReportType;
    filters: any;
    userId: string;
    schedule?: ReportSchedule;
    recipients?: string[];
  }): Promise<Report> {
    const report = await this.db.report.create({
      data: {
        name: data.name,
        type: data.type,
        filters: data.filters,
        userId: data.userId,
        schedule: data.schedule,
        recipients: data.recipients || [],
      },
    });

    logger.info(`Report created: ${report.id}`);
    
    // If report is scheduled, set up the schedule
    if (report.schedule) {
      await this.scheduleReport(report.id);
    }

    return report;
  }

  // Get a report by ID
  async getReportById(id: string): Promise<Report> {
    const report = await this.db.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new Error(`Report with ID ${id} not found`);
    }

    return report;
  }

  // Update an existing report
  async updateScheduledReport(id: string, data: Partial<Report>): Promise<Report> {
    const report = await this.db.report.update({
      where: { id },
      data,
    });

    logger.info(`Report updated: ${report.id}`);

    // Update schedule if needed
    if (data.schedule) {
      await this.scheduleReport(report.id);
    }

    return report;
  }

  // Delete a report
  async deleteScheduledReport(id: string): Promise<void> {
    await this.db.report.delete({
      where: { id },
    });

    logger.info(`Report deleted: ${id}`);

    // Remove report from schedule
    await this.unscheduleReport(id);
  }

  // Generate a report (with caching)
  async generateReport(reportId: string, forceRefresh = false): Promise<ReportData> {
    const report = await this.getReportById(reportId);
    const cacheKey = `report:${reportId}:${JSON.stringify(report.filters)}`;
    
    // Try to get from cache if not forcing refresh
    if (!forceRefresh) {
      const cachedReport = await redisClient.get(cacheKey);
      if (cachedReport) {
        logger.info(`Report retrieved from cache: ${reportId}`);
        return JSON.parse(cachedReport);
      }
    }
    
    // Generate report data
    const data = await generateReportContent(report.type, report.filters);
    
    // Update status
    await this.db.report.update({
      where: { id: reportId },
      data: { 
        status: ReportStatus.COMPLETED,
        lastRunAt: new Date(),
      },
    });
    
    // Cache the result (TTL: 1 hour)
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    
    return data;
  }

  // Schedule report generation
  async scheduleReport(reportId: string): Promise<void> {
    const report = await this.getReportById(reportId);
    
    if (!report.schedule) {
      logger.warn(`Cannot schedule report ${reportId} without schedule information`);
      return;
    }
    
    // Remove existing job if any
    await this.unscheduleReport(reportId);
    
    // Create a new job based on schedule
    let cronPattern: string;
    
    switch (report.schedule) {
      case ReportSchedule.DAILY:
        cronPattern = '0 8 * * *'; // Every day at 8 AM
        break;
      case ReportSchedule.WEEKLY:
        cronPattern = '0 8 * * 1'; // Every Monday at 8 AM
        break;
      case ReportSchedule.MONTHLY:
        cronPattern = '0 8 1 * *'; // 1st day of each month at 8 AM
        break;
      default:
        logger.error(`Unknown schedule type: ${report.schedule}`);
        return;
    }
    
    // Add to Bull queue with repeat options
    await reportQueue.add(
      { reportId },
      { 
        jobId: `report:${reportId}`,
        repeat: { cron: cronPattern },
      }
    );
    
    logger.info(`Report ${reportId} scheduled: ${report.schedule}`);
  }

  // Unschedule report generation
  async unscheduleReport(reportId: string): Promise<void> {
    const job = await reportQueue.getJob(`report:${reportId}`);
    if (job) {
      await job.remove();
      logger.info(`Report ${reportId} unscheduled`);
    }
  }

  // Send report via email
  async sendReportEmail(reportId: string, recipients?: string[]): Promise<void> {
    const report = await this.getReportById(reportId);
    const reportData = await this.generateReport(reportId, true);
    
    // Use specified recipients or default to report recipients
    const emailRecipients = recipients || report.recipients;
    
    if (!emailRecipients || emailRecipients.length === 0) {
      logger.warn(`No recipients specified for report ${reportId}`);
      return;
    }

    // Generate date range description
    const { startDate, endDate } = getDateRangeFromPeriod(report.filters.period || 'last30days');
    const dateRange = formatDateRange(startDate, endDate);

    // Create email content
    const emailContent = `
      <h1>${report.name}</h1>
      <p>Report period: ${dateRange}</p>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      <hr />
      ${this.formatReportHtml(reportData, report.type)}
      <hr />
      <p>This is an automated report from your CRM system.</p>
    `;

    // Send email
    try {
      await emailTransport.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@crm.example.com',
        to: emailRecipients.join(', '),
        subject: `CRM Report: ${report.name} - ${dateRange}`,
        html: emailContent,
        attachments: [
          {
            filename: `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
            content: this.formatReportCsv(reportData, report.type),
            contentType: 'text/csv',
          }
        ]
      });

      logger.info(`Report ${reportId} sent to ${emailRecipients.length} recipients`);
      
      // Update last sent time
      await this.db.report.update({
        where: { id: reportId },
        data: { lastSentAt: new Date() },
      });
    } catch (error) {
      logger.error(`Failed to send report ${reportId} via email: ${error.message}`);
      throw new Error(`Failed to send report via email: ${error.message}`);
    }
  }

  // Format report data as HTML
  private formatReportHtml(data: ReportData, type: ReportType): string {
    // Implementation depends on report type
    switch (type) {
      case ReportType.PIPELINE_PERFORMANCE:
        return this.formatPipelinePerformanceHtml(data);
      case ReportType.TEAM_PERFORMANCE:
        return this.formatTeamPerformanceHtml(data);
      case ReportType.LEAD_ANALYSIS:
        return this.formatLeadAnalysisHtml(data);
      default:
        return '<p>Report data not available in HTML format</p>';
    }
  }

  // Format report data as CSV
  private formatReportCsv(data: ReportData, type: ReportType): string {
    // Implementation depends on report type
    switch (type) {
      case ReportType.PIPELINE_PERFORMANCE:
        return this.formatPipelinePerformanceCsv(data);
      case ReportType.TEAM_PERFORMANCE:
        return this.formatTeamPerformanceCsv(data);
      case ReportType.LEAD_ANALYSIS:
        return this.formatLeadAnalysisCsv(data);
      default:
        return 'Report data not available in CSV format';
    }
  }

  // Format pipeline performance report as HTML
  private formatPipelinePerformanceHtml(data: ReportData): string {
    // Sample implementation - can be enhanced with more sophisticated HTML
    let html = '<h2>Conversion Rates</h2><table border="1" cellpadding="5" cellspacing="0">';
    html += '<tr><th>From Stage</th><th>To Stage</th><th>Rate</th></tr>';
    
    data.conversionRates.forEach(rate => {
      html += `<tr><td>${rate.fromStage}</td><td>${rate.toStage}</td><td>${(rate.rate * 100).toFixed(2)}%</td></tr>`;
    });
    
    html += '</table>';
    
    html += '<h2>Stage Times</h2><table border="1" cellpadding="5" cellspacing="0">';
    html += '<tr><th>Stage</th><th>Average Time (days)</th></tr>';
    
    data.stageTimes.forEach(time => {
      html += `<tr><td>${time.stage}</td><td>${(time.averageTime / 86400000).toFixed(1)}</td></tr>`;
    });
    
    html += '</table>';
    
    return html;
  }

  // Format team performance report as HTML
  private formatTeamPerformanceHtml(data: ReportData): string {
    // Sample implementation
    let html = '<h2>Team Performance</h2><table border="1" cellpadding="5" cellspacing="0">';
    html += '<tr><th>Team Member</th><th>Leads Generated</th><th>Conversion Rate</th><th>Value</th></tr>';
    
    data.teamPerformance.forEach(member => {
      html += `<tr><td>${member.name}</td><td>${member.leadsGenerated}</td>`;
      html += `<td>${(member.conversionRate * 100).toFixed(2)}%</td><td>$${member.value.toFixed(2)}</td></tr>`;
    });
    
    html += '</table>';
    
    return html;
  }

  // Format lead analysis report as HTML
  private formatLeadAnalysisHtml(data: ReportData): string {
    // Sample implementation
    let html = '<h2>Lead Source Analysis</h2><table border="1" cellpadding="5" cellspacing="0">';
    html += '<tr><th>Source</th><th>Count</th><th>Conversion Rate</th><th>Avg Value</th></tr>';
    
    data.leadsBySource.forEach(source => {
      html += `<tr><td>${source.source}</td><td>${source.count}</td>`;
      html += `<td>${(source.conversionRate * 100).toFixed(2)}%</td><td>$${source.avgValue.toFixed(2)}</td></tr>`;
    });
    
    html += '</table>';
    
    return html;
  }

  // Format pipeline performance report as CSV
  private formatPipelinePerformanceCsv(data: ReportData): string {
    let csv = 'From Stage,To Stage,Conversion Rate\n';
    
    data.conversionRates.forEach(rate => {
      csv += `"${rate.fromStage}","${rate.toStage}",${(rate.rate * 100).toFixed(2)}%\n`;
    });
    
    csv += '\nStage,Average Time (days)\n';
    
    data.stageTimes.forEach(time => {
      csv += `"${time.stage}",${(time.averageTime / 86400000).toFixed(1)}\n`;
    });
    
    return csv;
  }

  // Format team performance report as CSV
  private formatTeamPerformanceCsv(data: ReportData): string {
    let csv = 'Team Member,Leads Generated,Conversion Rate,Value\n';
    
    data.teamPerformance.forEach(member => {
      csv += `"${member.name}",${member.leadsGenerated},${(member.conversionRate * 100).toFixed(2)}%,$${member.value.toFixed(2)}\n`;
    });
    
    return csv;
  }

  // Format lead analysis report as CSV
  private formatLeadAnalysisCsv(data: ReportData): string {
    let csv = 'Source,Count,Conversion Rate,Average Value\n';
    
    data.leadsBySource.forEach(source => {
      csv += `"${source.source}",${source.count},${(source.conversionRate * 100).toFixed(2)}%,$${source.avgValue.toFixed(2)}\n`;
    });
    
    return csv;
  }
}

export default new ReportService(); 