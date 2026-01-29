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
  palavra_chave: string;
  lingua: Idioma;
}

export class CreateResearchDto {
  @ApiProperty({
    required: true,
    enum: TipoProjeto,
  })
  @IsEnum(TipoProjeto)
  tipo: TipoProjeto;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ required: true, enum: CategoriaProjeto })
  @IsNotEmpty()
  @IsString()
  @IsEnum(CategoriaProjeto)
  categoria: CategoriaProjeto;

  @ApiProperty({ required: true })
  @IsNotEmpty()
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
    type: 'string',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(3)
  @Transform(({ value }) => {
    return value.map((item) => {
      return { palavra_chave: item, lingua: Idioma.PT };
    });
  })
  @ValidateNested({ each: true })
  @Type(() => PalavraChaveBody)
  palavras_chave: PalavraChaveBody[];

  @ApiProperty({
    required: true,
    isArray: true,
    type: 'string',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(3)
  @Transform(({ value }) => {
    return value.map((item) => {
      return { palavra_chave: item, lingua: Idioma.EN };
    });
  })
  @ValidateNested({ each: true })
  @Type(() => PalavraChaveBody)
  key_words: PalavraChaveBody[];

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  objetivos: Number[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ResearchBody)
  corpo_projeto: ResearchBody;

  @IsNotEmpty()
  @IsInt()
  unidade_id: number;
}
