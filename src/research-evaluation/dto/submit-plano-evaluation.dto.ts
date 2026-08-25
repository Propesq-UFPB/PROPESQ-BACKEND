import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubmitNotaDto {
  @ApiProperty({
    type: 'number',
    format: 'int64',
    minimum: 1,
    nullable: false,
    description: 'ID do critério de avaliação associado',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  criterio_avaliacao_id!: number;

  @ApiProperty({
    type: 'number',
    format: 'float',
    minimum: 0,
    maximum: 10,
    nullable: false,
    description: 'Nota atribuída ao critério',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  nota!: number;
}

export class SubmitPlanoEvaluationDto {
  @ApiPropertyOptional({ type: 'string', description: 'Descrição ou parecer da avaliação do plano' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ type: [SubmitNotaDto], description: 'Lista de notas por critério de avaliação' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitNotaDto)
  notas!: SubmitNotaDto[];
}
