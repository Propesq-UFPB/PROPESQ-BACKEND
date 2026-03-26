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
  @IsNotEmpty()
  @IsDateString()
  data!: string;
}

export class CreateActivityWorkPlanDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  descricao!: string;

  @ApiProperty({
    type: [CreateMonthWorkPlanDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMonthWorkPlanDto)
  meses!: CreateMonthWorkPlanDto[];
}

export class CreateBodyWorkPlanDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  titulo!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  introducao!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  objetivos!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  metodologia!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  referencias!: string;
}

export class CreateWorkPlanDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  discente_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  usuario_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  pesquisa_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  modalidade!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  status!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  tipo_bolsa!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  cronograma_id!: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  direcionamento_plano!: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsInt()
  corpo_id!: number;

  @ApiProperty({
    type: CreateBodyWorkPlanDto,
    required: true,
  })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateBodyWorkPlanDto)
  corpo_plano_trabalho!: CreateBodyWorkPlanDto;

  @ApiProperty({
    type: [CreateActivityWorkPlanDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityWorkPlanDto)
  atividades!: CreateActivityWorkPlanDto[];
}
