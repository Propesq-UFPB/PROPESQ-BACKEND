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

export class SubmitEvaluationDto {
  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluationScoreDto)
  notas: EvaluationScoreDto[];
}

class EvaluationScoreDto {
  @ApiProperty({ type: 'number', format: 'float', minimum: 0, maximum: 10, nullable: false })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  nota!: number;

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
}
