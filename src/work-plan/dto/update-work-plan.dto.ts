import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateWorkPlanDto } from './create-work-plan.dto';

export class UpdateMonthWorkPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ type: 'string', format: 'date', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  data?: string;
}

export class UpdateActivityWorkPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  descricao?: string;

  @ApiProperty({
    type: [UpdateMonthWorkPlanDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMonthWorkPlanDto)
  meses?: UpdateMonthWorkPlanDto[];
}

export class UpdateBodyWorkPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  titulo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  introducao?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  objetivos?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  metodologia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  referencias?: string;
}

export class UpdateWorkPlanDto extends PartialType(
  OmitType(CreateWorkPlanDto, ['corpo_plano_trabalho', 'atividades'] as const),
) {
  @ApiProperty({ type: UpdateBodyWorkPlanDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateBodyWorkPlanDto)
  corpo_plano_trabalho?: UpdateBodyWorkPlanDto;

  @ApiProperty({ type: [UpdateActivityWorkPlanDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateActivityWorkPlanDto)
  atividades?: UpdateActivityWorkPlanDto[];
}
