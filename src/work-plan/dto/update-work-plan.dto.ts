import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateWorkPlanDto } from './create-work-plan.dto';

export class UpdateMonthWorkPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID do mês deve ser um número inteiro' })
  id?: number;

  @ApiProperty({ type: 'string', format: 'date', required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'A data do mês não pode ser vazia' })
  @IsDateString({}, { message: 'A data do mês deve estar em formato válido' })
  data?: string;
}

export class UpdateActivityWorkPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID da atividade deve ser um número inteiro' })
  id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'A descrição da atividade não pode ser vazia' })
  @IsString({ message: 'A descrição da atividade deve ser um texto' })
  descricao?: string;

  @ApiProperty({
    type: [UpdateMonthWorkPlanDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Os meses devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateMonthWorkPlanDto)
  meses?: UpdateMonthWorkPlanDto[];
}

export class UpdateBodyWorkPlanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'O título não pode ser vazio' })
  @IsString({ message: 'O título deve ser um texto' })
  titulo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'A introdução não pode ser vazia' })
  @IsString({ message: 'A introdução deve ser um texto' })
  introducao?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'Os objetivos não podem ser vazios' })
  @IsString({ message: 'Os objetivos devem ser um texto' })
  objetivos?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'A metodologia não pode ser vazia' })
  @IsString({ message: 'A metodologia deve ser um texto' })
  metodologia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'As referências não podem ser vazias' })
  @IsString({ message: 'As referências devem ser um texto' })
  referencias?: string;
}

export class UpdateWorkPlanDto extends PartialType(
  OmitType(CreateWorkPlanDto, ['corpo_plano_trabalho', 'atividades'] as const),
) {
  @ApiProperty({ type: UpdateBodyWorkPlanDto, required: false })
  @IsOptional()
  @IsNotEmpty({ message: 'O corpo do plano de trabalho não pode ser vazio' })
  @ValidateNested()
  @Type(() => UpdateBodyWorkPlanDto)
  corpo_plano_trabalho?: UpdateBodyWorkPlanDto;

  @ApiProperty({ type: [UpdateActivityWorkPlanDto], required: false })
  @IsOptional()
  @IsArray({ message: 'As atividades devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateActivityWorkPlanDto)
  atividades?: UpdateActivityWorkPlanDto[];
}
