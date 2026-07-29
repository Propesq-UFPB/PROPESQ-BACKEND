import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePerfilDiscenteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  matricula?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  lattes_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  data_nascimento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sexo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  raca?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estado_civil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nacionalidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  naturalidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo_sanguineo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome_pai?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome_mae?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  rg_emissao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orgao_emissor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titulo_eleitor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zona_eleitoral?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secao_eleitoral?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificado_militar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria_militar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cep?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo_logradouro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logradouro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  uf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone_ddd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular_ddd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  celular?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  curso?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  campus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  periodo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  semestre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cra?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  creditos_concluidos?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  reprovacoes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  situacao_academica?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  situacao_matricula?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  possui_necessidade?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo_necessidade?: string;
}
