import { StatusEdital, TipoEdital, TitulacaoMin } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateEditalCotaDistribuicaoDto } from './create-cota-distribuicao.dto';

class UpdatePeriodoDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  inicio?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'date',
    example: '2027-07-31',
  })
  @IsOptional()
  @IsDateString()
  fim?: string;
}

export class UpdateEditalDto {
  @ApiPropertyOptional({
    example: 'Edital PIBIC 2026',
    description: 'Título do edital (alias de descricao; usado pela tela Manage).',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Código do edital.' })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({ description: 'Descrição do edital.' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    type: UpdatePeriodoDto,
    description: 'Período de execução do projeto.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoDto)
  periodo_execucao?: UpdatePeriodoDto;

  @ApiPropertyOptional({
    type: UpdatePeriodoDto,
    description: 'Período de submissões.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoDto)
  periodo_submissao?: UpdatePeriodoDto;

  @ApiPropertyOptional({
    enum: StatusEdital,
    description: 'Novo status do edital.',
  })
  @IsOptional()
  @IsEnum(StatusEdital)
  status?: StatusEdital;

  @ApiPropertyOptional({ enum: TitulacaoMin })
  @IsOptional()
  @IsEnum(TitulacaoMin)
  titulacao_min?: TitulacaoMin;

  @ApiPropertyOptional({ enum: TipoEdital })
  @IsOptional()
  @IsEnum(TipoEdital)
  tipo?: TipoEdital;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limite_solicitacoes_orientador?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cota_bolsa_id?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limite_planos_orientador?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  avaliacao_vigente?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  apenas_orient_coordena_plano?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tec_admin_coord_proj?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  divulgar_resultado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  edital_para_voluntarios?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  apenas_colab_vol_cadastra_plano?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  prof_subst_cadastra_proj?: boolean;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  ano?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoria_id?: number;

  @ApiPropertyOptional({ type: [CreateEditalCotaDistribuicaoDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEditalCotaDistribuicaoDto)
  edital_cota_distribuicao?: CreateEditalCotaDistribuicaoDto[];
}
