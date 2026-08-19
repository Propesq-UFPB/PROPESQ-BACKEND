import { TipoProjeto } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCorpoProjetoDto } from './corpo-projeto.dto';

export class CreateResearchDto {
  @ApiProperty({
    required: true,
    enum: TipoProjeto,
  })
  @IsEnum(TipoProjeto, { message: 'O tipo do projeto é inválido' })
  tipo!: TipoProjeto;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O título em português é obrigatório' })
  @IsString({ message: 'O título em português deve ser um texto' })
  titulo!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O título em inglês é obrigatório' })
  @IsString({ message: 'O título em inglês deve ser um texto' })
  title!: string;

  @ApiProperty({ required: true, type: 'integer' })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro' })
  @Min(1, { message: 'O ID da categoria deve ser maior que zero' })
  categoria_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A vigência é obrigatória' })
  @IsDateString({}, { message: 'A vigência deve estar no formato de data válido' })
  vigencia!: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'A data de início deve estar no formato de data válido' })
  data_inicio!: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'A data de fim deve estar no formato de data válido' })
  data_fim!: Date;

  @ApiProperty({ required: true, description: 'E-mail para contato do projeto' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  email!: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: Number,
    description: 'IDs das palavras-chave cadastradas',
  })
  @IsNotEmpty({ message: 'As palavras-chave são obrigatórias' })
  @IsArray({ message: 'As palavras-chave devem ser um array' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Cada palavra-chave deve ser um ID numérico válido' })
  palavras_chave_ids!: number[];

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
  pesquisa_objetivo_ids!: number[];

  @ApiProperty({
    required: true,
    type: CreateCorpoProjetoDto,
    description: 'Conteúdo textual do projeto de pesquisa',
  })
  @IsDefined({ message: 'O corpo do projeto é obrigatório' })
  @IsNotEmptyObject({}, { message: 'O corpo do projeto é obrigatório' })
  @ValidateNested()
  @Type(() => CreateCorpoProjetoDto)
  corpo_projeto!: CreateCorpoProjetoDto;

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
  atividade_projeto_pesquisa_ids!: number[];

  @ApiProperty({ required: true, type: Number, description: 'ID da unidade acadêmica' })
  @IsNotEmpty()
  @IsInt({ message: 'O ID da unidade acadêmica deve ser um número inteiro' })
  unidade_id!: number;

  @ApiProperty({ required: true, type: Number, description: 'ID da área de conhecimento' })
  area_conhecimento_id!: number;
}
