import { CategoriaProjeto, TipoEdital, TipoIndiceMin, TitulacaoMin } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  isInt,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// Dtos auxiliares que compõem parte do edital
class PeriodoEditalDto {
  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsNotEmpty()
  @IsDateString()
  inicio: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsNotEmpty()
  @IsDateString()
  fim: Date;
}

class EditalCotaDistribuicaoDto {
  @ApiProperty({ required: true, type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  divulgar_resultado: boolean;

  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsInt()
  quantidade: number;

  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  fppi_min: number;

  @ApiProperty({ required: false, type: Number, description: 'Esse valor é opcional' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_max: number;

  @ApiProperty({ required: true, type: Number })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  media_min_proj: number;

  @ApiProperty({ required: true, type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  exige_doutorado: boolean;

  @ApiProperty({
    required: true,
    type: Number,
    description:
      'Campo opcional, não enviá-lo significa que não se deseja atribuir procentagem a novos doutorandos',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  percentual_cotas_novos_doutorandos: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_min_novos_doutorandos: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fppi_max_novos_doutorandos: number;
}

export class CreateEditalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ required: true, enum: TitulacaoMin })
  @IsNotEmpty()
  @IsEnum(TitulacaoMin)
  titulacao_min: TitulacaoMin;

  @ApiProperty({ required: true, enum: TipoEdital })
  @IsNotEmpty()
  @IsEnum(TipoEdital)
  tipo: TipoEdital;

  @ApiProperty({ required: false, enum: TipoIndiceMin })
  @IsOptional()
  @IsEnum(TipoIndiceMin)
  validar_indice_min?: TipoIndiceMin;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valor_indice_min?: number;

  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  limite_solicitacoes_orientador: number;

  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  limite_planos_orientador: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  edital_para_voluntarios: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  avaliacao_vigente: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  apenas_orient_coordena_plano: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  apenas_colab_vol_cadastra_plano: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  prof_subst_cadastra_proj: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  tec_admin_coord_proj: boolean;

  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  periodo_submissoes_id: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  periodo_correcao_plano?: number;

  @ApiProperty({ required: true, enum: CategoriaProjeto })
  @IsNotEmpty()
  @IsEnum(CategoriaProjeto)
  categoria: CategoriaProjeto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EditalCotaDistribuicaoDto)
  edital_cota_distribuicao: EditalCotaDistribuicaoDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoEditalDto)
  periodo_submissao: PeriodoEditalDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PeriodoEditalDto)
  periodo_correcao?: PeriodoEditalDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoEditalDto)
  periodo_execucao: PeriodoEditalDto;
}
