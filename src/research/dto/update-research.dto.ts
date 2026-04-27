import { CategoriaProjeto, TipoProjeto } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class updateResearchDto {
  @ApiProperty({
    required: false,
    enum: TipoProjeto,
  })
  @IsOptional()
  @IsEnum(TipoProjeto, { message: 'O tipo do projeto é inválido' })
  tipo?: TipoProjeto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'O título em português deve ser um texto' })
  titulo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'O título em inglês deve ser um texto' })
  title?: string;

  @ApiProperty({ required: false, enum: CategoriaProjeto })
  @IsOptional()
  @IsString({ message: 'A categoria do projeto deve ser um texto' })
  @IsEnum(CategoriaProjeto, { message: 'A categoria do projeto é inválida' })
  categoria?: CategoriaProjeto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'A vigência deve estar no formato de data válido' })
  vigencia?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'A data de início deve estar no formato de data válido' })
  data_inicio?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'A data de fim deve estar no formato de data válido' })
  data_fim?: Date;

  @ApiProperty({
    required: false,
    isArray: true,
    type: Number,
    description: 'IDs das palavras-chave cadastradas',
  })
  @IsOptional()
  @IsArray({ message: 'As palavras-chave devem ser um array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Cada palavra-chave deve ser um ID numérico válido' })
  palavras_chave_ids?: number[];

  @ApiProperty({ required: false, description: 'E-mail para contato do projeto' })
  @IsOptional()
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  email?: string;

  @ApiProperty({
    isArray: true,
    type: Number,
    required: false,
    description: 'IDs de objetivo_desenvolvimento_sustentavel para a tabela pesquisa_objetivo',
  })
  @IsOptional()
  @IsArray({ message: 'Os IDs de pesquisa_objetivo devem ser um array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Cada ID de pesquisa_objetivo deve ser um número inteiro' })
  pesquisa_objetivo_ids?: number[];

  @ApiProperty({
    required: false,
    type: Number,
    description: 'ID do corpo do projeto já cadastrado',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID do corpo do projeto deve ser um número inteiro' })
  corpo_projeto_id?: number;

  @ApiProperty({
    isArray: true,
    type: Number,
    required: false,
    description: 'IDs de atividade_projeto_pesquisa já cadastradas',
  })
  @IsOptional()
  @IsArray({ message: 'Os IDs das atividades devem ser um array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Cada ID de atividade deve ser um número inteiro' })
  atividade_projeto_pesquisa_ids?: number[];

  @ApiProperty({ required: false, type: Number, description: 'ID da unidade acadêmica' })
  @IsOptional()
  @IsInt({ message: 'O ID da unidade acadêmica deve ser um número inteiro' })
  unidade_id?: number;
}
