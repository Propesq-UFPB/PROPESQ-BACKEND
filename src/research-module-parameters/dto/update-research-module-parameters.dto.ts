import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const OPTIONAL_EMAIL =
  /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UpdateResearchModuleParametersDto {
  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  lateSubmissionToleranceDays!: number;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  maxRenewalsPerProject!: number;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  maxProjectDurationMonths!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  maxQuotaRequestsPerProject!: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  maxWorkPlansPerAdvisor!: number;

  @ApiProperty({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  scholarshipChangeCutoffDay!: number;

  @ApiProperty({ example: 'bolsas@ufpb.br' })
  @IsString()
  @MaxLength(255)
  @Matches(OPTIONAL_EMAIL, {
    message: 'O e-mail de alterações de bolsistas é inválido.',
  })
  emailScholarshipChanges!: string;

  @ApiProperty({ example: 'inovacao@ufpb.br' })
  @IsString()
  @MaxLength(255)
  @Matches(OPTIONAL_EMAIL, {
    message: 'O e-mail de notificações de invenção é inválido.',
  })
  emailInventionNotifications!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowPartialReportsIC!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowIndependentENICSummaries!: boolean;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  enicSummariesPerReviewer!: number;
}
