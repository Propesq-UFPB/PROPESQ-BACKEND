import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateMonthWorkPlanDto {
  @ApiProperty({ type: 'string', format: 'date', required: true })
  @IsNotEmpty({ message: 'A data do mês é obrigatória' })
  @IsDateString({}, { message: 'A data do mês deve estar em formato válido' })
  data!: string;
}

export class CreateActivityWorkPlanDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A descrição da atividade é obrigatória' })
  @IsString({ message: 'A descrição da atividade deve ser um texto' })
  descricao!: string;

  @ApiProperty({
    type: [CreateMonthWorkPlanDto],
    required: true,
  })
  @IsArray({ message: 'Os meses da atividade devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateMonthWorkPlanDto)
  meses!: CreateMonthWorkPlanDto[];
}

export class CreateBodyWorkPlanDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O título do plano é obrigatório' })
  @IsString({ message: 'O título do plano deve ser um texto' })
  titulo!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A introdução é obrigatória' })
  @IsString({ message: 'A introdução deve ser um texto' })
  introducao!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Os objetivos são obrigatórios' })
  @IsString({ message: 'Os objetivos devem ser um texto' })
  objetivos!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A metodologia é obrigatória' })
  @IsString({ message: 'A metodologia deve ser um texto' })
  metodologia!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'As referências são obrigatórias' })
  @IsString({ message: 'As referências devem ser um texto' })
  referencias!: string;
}

export class CreateWorkPlanDto {
  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID do discente é obrigatório' })
  @IsInt({ message: 'O ID do discente deve ser um número inteiro' })
  discente_id!: number;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @IsInt({ message: 'O ID do usuário deve ser um número inteiro' })
  usuario_id!: number;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID da pesquisa é obrigatório' })
  @IsInt({ message: 'O ID da pesquisa deve ser um número inteiro' })
  pesquisa_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'A modalidade é obrigatória' })
  @IsString({ message: 'A modalidade deve ser um texto' })
  modalidade!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  @IsString({ message: 'O status deve ser um texto' })
  status!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O tipo de bolsa é obrigatório' })
  @IsString({ message: 'O tipo de bolsa deve ser um texto' })
  tipo_bolsa!: string;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNotEmpty({ message: 'O ID do cronograma é obrigatório' })
  @IsInt({ message: 'O ID do cronograma deve ser um número inteiro' })
  cronograma_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O direcionamento do plano é obrigatório' })
  @IsString({ message: 'O direcionamento do plano deve ser um texto' })
  direcionamento_plano!: string;

  @ApiProperty({
    type: CreateBodyWorkPlanDto,
    required: true,
  })
  @IsNotEmpty({ message: 'O corpo do plano de trabalho é obrigatório' })
  @IsObject({ message: 'O corpo do plano de trabalho deve ser um objeto' })
  @ValidateNested()
  @Type(() => CreateBodyWorkPlanDto)
  corpo_plano_trabalho!: CreateBodyWorkPlanDto;

  @ApiProperty({
    type: [CreateActivityWorkPlanDto],
    required: true,
  })
  @IsArray({ message: 'As atividades devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateActivityWorkPlanDto)
  atividades!: CreateActivityWorkPlanDto[];
}
