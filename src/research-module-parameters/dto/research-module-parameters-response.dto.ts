import { ApiProperty } from '@nestjs/swagger';

export class ResearchModuleParametersResponseDto {
  @ApiProperty({ example: 0 })
  lateSubmissionToleranceDays!: number;

  @ApiProperty({ example: 0 })
  maxRenewalsPerProject!: number;

  @ApiProperty({ example: 12 })
  maxProjectDurationMonths!: number;

  @ApiProperty({ example: 1 })
  maxQuotaRequestsPerProject!: number;

  @ApiProperty({ example: 5 })
  maxWorkPlansPerAdvisor!: number;

  @ApiProperty({ example: 20 })
  scholarshipChangeCutoffDay!: number;

  @ApiProperty({ example: 'bolsas@ufpb.br' })
  emailScholarshipChanges!: string;

  @ApiProperty({ example: 'inovacao@ufpb.br' })
  emailInventionNotifications!: string;

  @ApiProperty({ example: false })
  allowPartialReportsIC!: boolean;

  @ApiProperty({ example: false })
  allowIndependentENICSummaries!: boolean;

  @ApiProperty({ example: 5 })
  enicSummariesPerReviewer!: number;

  @ApiProperty({ example: '2026-07-21T21:00:00.000Z' })
  updatedAt!: string;
}
