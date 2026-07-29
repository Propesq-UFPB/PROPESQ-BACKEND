import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusIndicacaoPlano } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class WorkPlanIndicacoesQueryDto {
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

  @ApiPropertyOptional({ description: 'Filtra por ID do edital.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  edital_id?: number;

  @ApiPropertyOptional({ enum: StatusIndicacaoPlano })
  @IsOptional()
  @IsEnum(StatusIndicacaoPlano)
  status_indicacao?: StatusIndicacaoPlano;

  @ApiPropertyOptional({
    description: 'Busca textual no título do plano ou do projeto.',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
