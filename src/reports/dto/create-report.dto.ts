import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusRelatorio, TipoRelatorio } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  projeto_pesquisa_id!: number;

  @ApiProperty({ enum: TipoRelatorio, example: TipoRelatorio.PARCIAL })
  @IsEnum(TipoRelatorio)
  tipo!: TipoRelatorio;

  @ApiPropertyOptional({ enum: StatusRelatorio, example: StatusRelatorio.PENDENTE })
  @IsOptional()
  @IsEnum(StatusRelatorio)
  status?: StatusRelatorio;

  @ApiProperty({ example: '2026-08-20', description: 'Data limite (ISO date)' })
  @IsDateString()
  prazo_fim!: string;
}
