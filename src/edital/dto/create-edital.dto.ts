import { StatusEdital, TipoEdital, TitulacaoMin } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateEditalCotaDistribuicaoDto } from './create-cota-distribuicao.dto';

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

export class CreateEditalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({
    required: true,
    enum: [StatusEdital.RASCUNHO, StatusEdital.PUBLICADO],
    description: 'Define se o edital será salvo como rascunho ou publicado imediatamente.',
  })
  @IsNotEmpty()
  @IsIn([StatusEdital.RASCUNHO, StatusEdital.PUBLICADO])
  status: StatusEdital;

  @ApiProperty({ required: true, enum: TitulacaoMin })
  @IsNotEmpty()
  @IsEnum(TitulacaoMin)
  titulacao_min: TitulacaoMin;

  @ApiProperty({ required: true, enum: TipoEdital })
  @IsNotEmpty()
  @IsEnum(TipoEdital)
  tipo: TipoEdital;

  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  limite_solicitacoes_orientador: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cota_bolsa_id: number;

  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  limite_planos_orientador: number;

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
  tec_admin_coord_proj: boolean;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsBoolean()
  divulgar_resultado: boolean;

  @ApiProperty({ required: true, type: 'integer' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  categoria_id: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateEditalCotaDistribuicaoDto)
  edital_cota_distribuicao: CreateEditalCotaDistribuicaoDto[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoEditalDto)
  periodo_submissao: PeriodoEditalDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PeriodoEditalDto)
  periodo_execucao: PeriodoEditalDto;
}
