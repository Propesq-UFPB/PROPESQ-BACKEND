import { Test, TestingModule } from '@nestjs/testing';
import { ResearchModuleParametersService } from './research-module-parameters.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRow = {
  id: 1,
  late_submission_tolerance_days: 0,
  max_renewals_per_project: 0,
  max_project_duration_months: 12,
  scholarship_change_cutoff_day: 20,
  email_scholarship_changes: '',
  email_invention_notifications: '',
  allow_partial_reports_ic: false,
  allow_independent_enic_summaries: false,
  enic_summaries_per_reviewer: 5,
  atualizado_em: new Date('2026-09-15T12:00:00.000Z'),
};

const mockPrisma = {
  parametro_modulo_pesquisa: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('ResearchModuleParametersService', () => {
  let service: ResearchModuleParametersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchModuleParametersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ResearchModuleParametersService);
  });

  it('get maps row without quota/work-plan limit fields', async () => {
    mockPrisma.parametro_modulo_pesquisa.findUnique.mockResolvedValue(mockRow);

    await expect(service.get()).resolves.toEqual({
      lateSubmissionToleranceDays: 0,
      maxRenewalsPerProject: 0,
      maxProjectDurationMonths: 12,
      scholarshipChangeCutoffDay: 20,
      emailScholarshipChanges: '',
      emailInventionNotifications: '',
      allowPartialReportsIC: false,
      allowIndependentENICSummaries: false,
      enicSummariesPerReviewer: 5,
      updatedAt: '2026-09-15T12:00:00.000Z',
    });
  });

  it('update upserts without quota/work-plan limit fields', async () => {
    mockPrisma.parametro_modulo_pesquisa.upsert.mockResolvedValue(mockRow);

    const dto = {
      lateSubmissionToleranceDays: 1,
      maxRenewalsPerProject: 2,
      maxProjectDurationMonths: 18,
      scholarshipChangeCutoffDay: 15,
      emailScholarshipChanges: 'a@b.com',
      emailInventionNotifications: 'c@d.com',
      allowPartialReportsIC: true,
      allowIndependentENICSummaries: true,
      enicSummariesPerReviewer: 3,
    };

    await service.update(dto);

    expect(mockPrisma.parametro_modulo_pesquisa.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.not.objectContaining({
          max_quota_requests_per_project: expect.anything(),
          max_work_plans_per_advisor: expect.anything(),
        }),
        update: expect.not.objectContaining({
          max_quota_requests_per_project: expect.anything(),
          max_work_plans_per_advisor: expect.anything(),
        }),
      }),
    );
  });
});
