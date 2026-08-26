import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateResearchProjectMonthDto {
  @ApiProperty({ type: 'string', format: 'date' })
  @IsNotEmpty({ message: 'A data do mês é obrigatória' })
  @IsDateString({}, { message: 'A data do mês deve estar em formato válido' })
  data!: string;
}

export class CreateResearchProjectActivityDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'A descrição da atividade é obrigatória' })
  @IsString({ message: 'A descrição da atividade deve ser um texto' })
  descricao!: string;

  @ApiProperty({ type: [CreateResearchProjectMonthDto] })
  @IsArray({ message: 'Os meses da atividade devem ser um array' })
  @ArrayMinSize(1, { message: 'Cada atividade deve possuir pelo menos um mês' })
  @ValidateNested({ each: true })
  @Type(() => CreateResearchProjectMonthDto)
  meses!: CreateResearchProjectMonthDto[];
}
