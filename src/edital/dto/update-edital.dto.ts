import { CategoriaProjeto, TipoEdital, TipoIndiceMin, TitulacaoMin } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  isInt,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UpdateEditalCotaDistribuicaoDto } from './update-cota-distribuicao.dto';
import { CreateEditalCotaDistribuicaoDto } from './create-cota-distribuicao.dto';

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
    description: 'Array para editar distribuições de cota já existentes e que serão editados',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEditalCotaDistribuicaoDto)
  update_edital_cota_distribuicao?: UpdateEditalCotaDistribuicaoDto[] | null;

  @ApiPropertyOptional({
    type: [CreateEditalCotaDistribuicaoDto],
    description: 'Array para cadastrar novas distribuições de cotas',
  })
  @IsOptional()
  create_edital_cota_distribuicao?: CreateEditalCotaDistribuicaoDto[];

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

  @ApiPropertyOptional({
    type: 'array',
    format: 'number',
    nullable: true,
    description: "Array que contém id's de distribuições de cotas a serem excluídas",
  })
  delete_cota_distribuicao: number[];
}
