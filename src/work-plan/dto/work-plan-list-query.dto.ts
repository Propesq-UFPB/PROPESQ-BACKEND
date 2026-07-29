import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusIndicacaoPlano } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class WorkPlanListQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Filtra por ID do projeto de pesquisa.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pesquisa_id?: number;

  @ApiPropertyOptional({ description: 'Status legado do plano (string livre).' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ enum: StatusIndicacaoPlano })
  @IsOptional()
  @IsEnum(StatusIndicacaoPlano)
  status_indicacao?: StatusIndicacaoPlano;

  @ApiPropertyOptional({
    description:
      'Filtro explícito por usuario_id do plano (ADMIN/GESTOR). COORDENADOR ignora e usa escopo próprio.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuario_id?: number;
}
