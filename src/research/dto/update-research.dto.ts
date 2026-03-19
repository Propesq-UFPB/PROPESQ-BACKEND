import { CategoriaProjeto, Idioma, TipoProjeto } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ResearchBody {
  @IsString()
  resumo: string;

  @IsString()
  abstract: string;

  @IsString()
  introducao: string;

  @IsString()
  objetivos: string;

  @IsString()
  metodologia: string;

  @IsString()
  resultados_esperados: string;

  @IsString()
  referencias: string;
}

class PalavraChaveBody {
  @IsNotEmpty()
  @IsString()
  palavra_chave: string;

  @ApiProperty({ enum: Idioma })
  @IsNotEmpty()
  @IsEnum(Idioma)
  lingua: Idioma;
}

class AtividadesBody {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({
    isArray: true,
    type: 'string',
    format: 'date',
    required: true,
  })
  @IsArray()
  @IsDateString({}, { each: true })
  meses: Array<Date>;
}

export class updateResearchDto {
  @ApiProperty({
    required: false,
    enum: TipoProjeto,
  })
  @IsEnum(TipoProjeto)
  tipo: TipoProjeto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  titulo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ required: false, enum: CategoriaProjeto })
  @IsOptional()
  @IsString()
  @IsEnum(CategoriaProjeto)
  categoria: CategoriaProjeto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  vigencia: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  data_inicio: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  data_fim: Date;

  @ApiProperty({
    required: true,
    isArray: true,
    minLength: 3,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PalavraChaveBody)
  palavras_chave: PalavraChaveBody[];

  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ isArray: true, type: 'number' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  objetivos: Number[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResearchBody)
  corpo_projeto: ResearchBody;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtividadesBody)
  atividades: AtividadesBody[];

  @IsOptional()
  @IsInt()
  unidade_id: number;
}
