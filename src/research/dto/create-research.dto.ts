import { CategoriaProjeto, TipoProjeto } from '@prisma/client';
import {
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
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ResearchBody {
  @IsString({ message: 'O resumo deve ser um texto' })
  resumo!: string;

  @IsString({ message: 'O abstract deve ser um texto' })
  abstract!: string;

  @IsString({ message: 'A introdução deve ser um texto' })
  introducao!: string;

  @IsString({ message: 'Os objetivos devem ser um texto' })
  objetivos!: string;

  @IsString({ message: 'A metodologia deve ser um texto' })
  metodologia!: string;

  @IsString({ message: 'Os resultados esperados devem ser um texto' })
  resultados_esperados!: string;

  @IsString({ message: 'As referências devem ser um texto' })
  referencias!: string;
}

class AtividadesBody {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty({ message: 'A descrição da atividade é obrigatória' })
  @IsString({ message: 'A descrição da atividade deve ser um texto' })
  descricao!: string;

  @ApiProperty({
    isArray: true,
    type: 'string',
    format: 'date',
    required: true,
  })
  @IsArray()
  @IsDateString({}, { each: true, message: 'Cada mês deve estar no formato de data válido' })
  meses!: Array<Date>;
}

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

  @ApiProperty({ required: true, enum: CategoriaProjeto })
  @IsNotEmpty({ message: 'A categoria do projeto é obrigatória' })
  @IsString({ message: 'A categoria do projeto deve ser um texto' })
  @IsEnum(CategoriaProjeto, { message: 'A categoria do projeto é inválida' })
  categoria!: CategoriaProjeto;

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

  @ApiProperty({ required: true, description: 'E-mail para contato do projeto' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório' })
  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  email!: string;

  @ApiProperty({ isArray: true, type: 'number' })
  @IsOptional()
  @IsArray({ message: 'Os objetivos devem ser um array de IDs' })
  @IsInt({ each: true, message: 'Cada objetivo deve ser um número inteiro' })
  objetivos!: number[];

  @ApiProperty({ required: true, description: 'Corpo textual do projeto' })
  @IsNotEmpty()
  @IsObject({ message: 'O corpo do projeto deve ser um objeto' })
  @ValidateNested()
  @Type(() => ResearchBody)
  corpo_projeto!: ResearchBody;

  @ApiProperty({ type: [AtividadesBody], description: 'Atividades do projeto' })
  @IsArray({ message: 'As atividades devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => AtividadesBody)
  atividades!: AtividadesBody[];

  @ApiProperty({ required: true, type: Number, description: 'ID da unidade acadêmica' })
  @IsNotEmpty()
  @IsInt({ message: 'O ID da unidade acadêmica deve ser um número inteiro' })
  unidade_id!: number;
}
