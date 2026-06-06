import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEvaluationCriterionDto {
  @ApiPropertyOptional({
    example: 'Metodologia',
    description: 'Nome identificador do critério de avaliação.',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome?: string;

  @ApiPropertyOptional({
    example: 'Avalia a adequação da metodologia proposta.',
    description: 'Descrição detalhada do critério.',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string;

  @ApiPropertyOptional({ example: 0.3, description: 'Peso do critério na nota final.' })
  @IsOptional()
  @IsNumber({}, { message: 'O peso deve ser um número.' })
  @Min(0.01, { message: 'O peso deve ser no mínimo 0.01.' })
  peso?: number;

  @ApiPropertyOptional({ example: 10, description: 'Nota máxima atribuível a este critério.' })
  @IsOptional()
  @IsNumber({}, { message: 'A nota máxima deve ser um número.' })
  @Min(0.01, { message: 'A nota máxima deve ser no mínimo 0.01.' })
  nota_maxima?: number;

  @ApiPropertyOptional({ example: true, description: 'Indica se o critério está ativo.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
