// dto/submit-plano-evaluation.dto.ts
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class SubmitPlanoEvaluationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitNotaDto)
  notas: SubmitNotaDto[];

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class SubmitNotaDto {
  @IsInt()
  criterio_avaliacao_id: number;

  @IsNumber()
  @Min(0)
  nota: number;
}
