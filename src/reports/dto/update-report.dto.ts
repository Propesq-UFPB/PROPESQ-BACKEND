import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusRelatorio, TipoRelatorio } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class UpdateReportDto {
  @ApiPropertyOptional({ enum: TipoRelatorio })
  @IsOptional()
  @IsEnum(TipoRelatorio)
  tipo?: TipoRelatorio;

  @ApiPropertyOptional({ enum: StatusRelatorio })
  @IsOptional()
  @IsEnum(StatusRelatorio)
  status?: StatusRelatorio;

  @ApiPropertyOptional({ example: '2026-08-20' })
  @IsOptional()
  @IsDateString()
  prazo_fim?: string;
}
