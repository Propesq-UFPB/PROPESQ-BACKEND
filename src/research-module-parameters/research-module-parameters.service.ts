import { Injectable } from '@nestjs/common';
import { parametro_modulo_pesquisa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateResearchModuleParametersDto } from './dto/update-research-module-parameters.dto';
import { ResearchModuleParametersResponseDto } from './dto/research-module-parameters-response.dto';

const SINGLETON_ID = 1;

const DEFAULTS = {
  late_submission_tolerance_days: 0,
  max_renewals_per_project: 0,
  max_project_duration_months: 12,
  max_quota_requests_per_project: 1,
  max_work_plans_per_advisor: 5,
  scholarship_change_cutoff_day: 20,
  email_scholarship_changes: '',
  email_invention_notifications: '',
  allow_partial_reports_ic: false,
  allow_independent_enic_summaries: false,
  enic_summaries_per_reviewer: 5,
} as const;

@Injectable()
export class ResearchModuleParametersService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<ResearchModuleParametersResponseDto> {
    const row = await this.ensureSingleton();
    return this.toResponseDto(row);
  }

  async update(
    dto: UpdateResearchModuleParametersDto,
  ): Promise<ResearchModuleParametersResponseDto> {
    const row = await this.prisma.parametro_modulo_pesquisa.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        late_submission_tolerance_days: dto.lateSubmissionToleranceDays,
        max_renewals_per_project: dto.maxRenewalsPerProject,
        max_project_duration_months: dto.maxProjectDurationMonths,
        max_quota_requests_per_project: dto.maxQuotaRequestsPerProject,
        max_work_plans_per_advisor: dto.maxWorkPlansPerAdvisor,
        scholarship_change_cutoff_day: dto.scholarshipChangeCutoffDay,
        email_scholarship_changes: dto.emailScholarshipChanges.trim(),
        email_invention_notifications: dto.emailInventionNotifications.trim(),
        allow_partial_reports_ic: dto.allowPartialReportsIC,
        allow_independent_enic_summaries: dto.allowIndependentENICSummaries,
        enic_summaries_per_reviewer: dto.enicSummariesPerReviewer,
      },
      update: {
        late_submission_tolerance_days: dto.lateSubmissionToleranceDays,
        max_renewals_per_project: dto.maxRenewalsPerProject,
        max_project_duration_months: dto.maxProjectDurationMonths,
        max_quota_requests_per_project: dto.maxQuotaRequestsPerProject,
        max_work_plans_per_advisor: dto.maxWorkPlansPerAdvisor,
        scholarship_change_cutoff_day: dto.scholarshipChangeCutoffDay,
        email_scholarship_changes: dto.emailScholarshipChanges.trim(),
        email_invention_notifications: dto.emailInventionNotifications.trim(),
        allow_partial_reports_ic: dto.allowPartialReportsIC,
        allow_independent_enic_summaries: dto.allowIndependentENICSummaries,
        enic_summaries_per_reviewer: dto.enicSummariesPerReviewer,
      },
    });

    return this.toResponseDto(row);
  }

  private async ensureSingleton(): Promise<parametro_modulo_pesquisa> {
    const existing = await this.prisma.parametro_modulo_pesquisa.findUnique({
      where: { id: SINGLETON_ID },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.parametro_modulo_pesquisa.create({
      data: {
        id: SINGLETON_ID,
        ...DEFAULTS,
      },
    });
  }

  private toResponseDto(
    row: parametro_modulo_pesquisa,
  ): ResearchModuleParametersResponseDto {
    return {
      lateSubmissionToleranceDays: row.late_submission_tolerance_days,
      maxRenewalsPerProject: row.max_renewals_per_project,
      maxProjectDurationMonths: row.max_project_duration_months,
      maxQuotaRequestsPerProject: row.max_quota_requests_per_project,
      maxWorkPlansPerAdvisor: row.max_work_plans_per_advisor,
      scholarshipChangeCutoffDay: row.scholarship_change_cutoff_day,
      emailScholarshipChanges: row.email_scholarship_changes,
      emailInventionNotifications: row.email_invention_notifications,
      allowPartialReportsIC: row.allow_partial_reports_ic,
      allowIndependentENICSummaries: row.allow_independent_enic_summaries,
      enicSummariesPerReviewer: row.enic_summaries_per_reviewer,
      updatedAt: row.atualizado_em.toISOString(),
    };
  }
}
