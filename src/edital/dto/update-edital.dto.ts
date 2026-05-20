import { CategoriaProjeto, TipoEdital, TipoIndiceMin, TitulacaoMin } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class UpdatePeriodoEditalDto {
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  inicio?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  fim?: Date;
}

class UpdateEditalCotaDistribuicaoDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  divulgar_resultado?: boolean;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  quantidade?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_min?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_max?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  media_min_proj?: number;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  exige_doutorado?: boolean;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentual_cotas_novos_doutorandos?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_min_novos_doutorandos?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_max_novos_doutorandos?: number;
}

export class UpdateEditalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ enum: TitulacaoMin })
  @IsOptional()
  @IsEnum(TitulacaoMin)
  titulacao_min?: TitulacaoMin;

  @ApiPropertyOptional({ enum: TipoEdital })
  @IsOptional()
  @IsEnum(TipoEdital)
  tipo?: TipoEdital;

  @ApiPropertyOptional({ enum: TipoIndiceMin })
  @IsOptional()
  @IsEnum(TipoIndiceMin)
  validar_indice_min?: TipoIndiceMin;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valor_indice_min?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limite_solicitacoes_orientador?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limite_planos_orientador?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  edital_para_voluntarios?: boolean;

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
  apenas_colab_vol_cadastra_plano?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  prof_subst_cadastra_proj?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tec_admin_coord_proj?: boolean;

  @ApiPropertyOptional({ enum: CategoriaProjeto })
  @IsOptional()
  @IsEnum(CategoriaProjeto)
  categoria?: CategoriaProjeto;

  @ApiPropertyOptional({
    nullable: true,
    type: [UpdateEditalCotaDistribuicaoDto],
    description:
      'null = não altera distribuição de cotas. [] ou array com itens = substitui distribuição de cotas.',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEditalCotaDistribuicaoDto)
  edital_cota_distribuicao?: UpdateEditalCotaDistribuicaoDto[] | null;

  @ApiPropertyOptional({ type: UpdatePeriodoEditalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoEditalDto)
  periodo_submissao?: UpdatePeriodoEditalDto;

  @ApiPropertyOptional({ type: UpdatePeriodoEditalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoEditalDto)
  periodo_correcao?: UpdatePeriodoEditalDto;

  @ApiPropertyOptional({ type: UpdatePeriodoEditalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePeriodoEditalDto)
  periodo_execucao?: UpdatePeriodoEditalDto;
}
