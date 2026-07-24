import { StatusEdital } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdatePeriodoExecucaoDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2026-08-01',
    description: 'Data de início da execução do projeto.',
  })
  @IsOptional()
  @IsDateString()
  inicio?: Date;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2027-07-31',
    description: 'Data final da execução do projeto.',
  })
  @IsOptional()
  @IsDateString()
  fim?: Date;
}

export class UpdateEditalDto {
  @ApiPropertyOptional({
    example: 'Edital PIBIC 2026',
    description: 'Título do edital.',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({
    type: UpdatePeriodoExecucaoDto,
    description: 'Período de execução do projeto.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoExecucaoDto)
  periodo_execucao?: UpdatePeriodoExecucaoDto;

  @ApiPropertyOptional({
    enum: StatusEdital,
    description: 'Novo status do edital.',
  })
  @IsOptional()
  @IsEnum(StatusEdital)
  status?: StatusEdital;
}
