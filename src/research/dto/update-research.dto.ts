import { TipoProjeto } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateResearchProjectBodyDto } from './research-body.dto';
import { CreateResearchProjectActivityDto } from './research-activity.dto';

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

  @ApiPropertyOptional({ type: 'integer' })
  @IsOptional()
  @IsInt()
  categoria_id?: number;

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

  @ApiPropertyOptional({
    type: UpdateResearchProjectBodyDto,
    description: 'Campos do corpo do projeto que serão atualizados',
  })
  @IsOptional()
  @IsNotEmptyObject({}, { message: 'O corpo do projeto não pode ser vazio' })
  @ValidateNested()
  @Type(() => UpdateResearchProjectBodyDto)
  corpo_projeto?: UpdateResearchProjectBodyDto;

  @ApiProperty({
    isArray: true,
    type: CreateResearchProjectActivityDto,
    required: false,
    description: 'Nova lista de atividades e meses do projeto',
  })
  @IsOptional()
  @IsArray({ message: 'As atividades devem ser um array' })
  @ArrayMinSize(1, { message: 'O projeto deve possuir pelo menos uma atividade' })
  @ValidateNested({ each: true })
  @Type(() => CreateResearchProjectActivityDto)
  atividades?: CreateResearchProjectActivityDto[];

  @ApiProperty({ required: false, type: Number, description: 'ID da unidade acadêmica' })
  @IsOptional()
  @IsInt({ message: 'O ID da unidade acadêmica deve ser um número inteiro' })
  unidade_id?: number;
}
