import { TipoProjeto } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateResearchProjectBodyDto } from './research-body.dto';
import { CreateResearchProjectActivityDto } from './research-activity.dto';
import {
  CreateResearchProjectExternalMemberDto,
  CreateResearchProjectMemberDto,
} from './research-member.dto';

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

  @ApiProperty({
    required: false,
    type: 'integer',
    description: 'Mantido para compatibilidade; quando há edital, a categoria é obtida dele.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro' })
  @Min(1, { message: 'O ID da categoria deve ser maior que zero' })
  categoria_id?: number;

  @ApiProperty({ required: true, type: 'integer', description: 'ID do edital de pesquisa' })
  @Type(() => Number)
  @IsInt({ message: 'O ID do edital deve ser um número inteiro' })
  @Min(1, { message: 'O ID do edital deve ser maior que zero' })
  edital_id!: number;

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

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Palavras-chave em português a criar com o projeto',
  })
  @IsOptional()
  @IsArray({ message: 'As palavras-chave devem ser um array' })
  @ArrayMinSize(1, { message: 'Informe ao menos uma palavra-chave' })
  @IsString({ each: true, message: 'Cada palavra-chave deve ser um texto' })
  palavras_chave?: string[];

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Palavras-chave em inglês a criar com o projeto',
  })
  @IsOptional()
  @IsArray({ message: 'As palavras-chave em inglês devem ser um array' })
  @ArrayMinSize(1, { message: 'Informe ao menos uma palavra-chave em inglês' })
  @IsString({ each: true, message: 'Cada palavra-chave em inglês deve ser um texto' })
  key_words?: string[];

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
    type: CreateResearchProjectBodyDto,
    description: 'Conteúdo textual do projeto de pesquisa',
  })
  @IsDefined({ message: 'O corpo do projeto é obrigatório' })
  @IsNotEmptyObject({}, { message: 'O corpo do projeto é obrigatório' })
  @ValidateNested()
  @Type(() => CreateResearchProjectBodyDto)
  corpo_projeto!: CreateResearchProjectBodyDto;

  @ApiProperty({
    isArray: true,
    type: CreateResearchProjectActivityDto,
    required: true,
    description: 'Atividades e meses que serão criados junto com o projeto',
  })
  @IsArray({ message: 'As atividades devem ser um array' })
  @ArrayMinSize(1, { message: 'O projeto deve possuir pelo menos uma atividade' })
  @ValidateNested({ each: true })
  @Type(() => CreateResearchProjectActivityDto)
  atividades!: CreateResearchProjectActivityDto[];

  @ApiProperty({ required: true, type: Number, description: 'ID da unidade acadêmica' })
  @IsNotEmpty()
  @IsInt({ message: 'O ID da unidade acadêmica deve ser um número inteiro' })
  unidade_id!: number;

  @ApiProperty({ required: true, type: Number, description: 'ID da área de conhecimento' })
  @Type(() => Number)
  @IsInt({ message: 'O ID da área de conhecimento deve ser um número inteiro' })
  @Min(1, { message: 'O ID da área de conhecimento deve ser maior que zero' })
  area_conhecimento_id!: number;

  @ApiProperty({ required: true, maxLength: 512 })
  @IsString({ message: 'A linha de pesquisa deve ser um texto' })
  @IsNotEmpty({ message: 'A linha de pesquisa é obrigatória' })
  @MaxLength(512, { message: 'A linha de pesquisa deve possuir no máximo 512 caracteres' })
  linha_pesquisa!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: 'O indicador de vínculo com grupo deve ser booleano' })
  vinculado_grupo_pesquisa?: boolean;

  @ApiProperty({ required: false, type: Number })
  @ValidateIf((dto: CreateResearchDto) => dto.vinculado_grupo_pesquisa === true)
  @Type(() => Number)
  @IsInt({ message: 'O ID do grupo de pesquisa deve ser um número inteiro' })
  @Min(1, { message: 'O ID do grupo de pesquisa deve ser maior que zero' })
  grupo_pesquisa_id?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean({ message: 'O indicador de comitê de ética deve ser booleano' })
  possui_comite_etica?: boolean;

  @ApiProperty({ required: false, maxLength: 255 })
  @ValidateIf((dto: CreateResearchDto) => dto.possui_comite_etica === true)
  @IsString({ message: 'O comitê de ética deve ser um texto' })
  @IsNotEmpty({
    message: 'O comitê de ética é obrigatório quando a opção correspondente é marcada',
  })
  @MaxLength(255, { message: 'O comitê de ética deve possuir no máximo 255 caracteres' })
  comite_etica?: string;

  @ApiProperty({ required: false, maxLength: 255 })
  @ValidateIf((dto: CreateResearchDto) => dto.possui_comite_etica === true)
  @IsString({ message: 'O número do protocolo deve ser um texto' })
  @IsNotEmpty({
    message: 'O número do protocolo é obrigatório quando a opção correspondente é marcada',
  })
  @MaxLength(255, { message: 'O número do protocolo deve possuir no máximo 255 caracteres' })
  numero_protocolo?: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: CreateResearchProjectMemberDto,
    description: 'Membros do projeto que já possuem usuário cadastrado no sistema',
  })
  @IsOptional()
  @IsArray({ message: 'Os membros devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateResearchProjectMemberDto)
  membros?: CreateResearchProjectMemberDto[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: CreateResearchProjectExternalMemberDto,
    description: 'Membros externos vinculados ao projeto',
  })
  @IsOptional()
  @IsArray({ message: 'Os membros externos devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateResearchProjectExternalMemberDto)
  membros_externos?: CreateResearchProjectExternalMemberDto[];
}
