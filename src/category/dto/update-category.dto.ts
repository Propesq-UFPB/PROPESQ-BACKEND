import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    type: 'string',
    maxLength: 255,

    example: 'Iniciação Científica',
    description: 'Denominação da categoria.',
  })
  @IsOptional()
  @IsString({ message: 'A denominação deve ser um texto.' })
  @MaxLength(255, { message: 'A denominação deve ter no máximo 255 caracteres.' })
  denominacao?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição da categoria.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A ordem deve ser um número inteiro.' })
  @Min(1, { message: 'A ordem deve ser no mínimo 1.' })
  ordem?: number;

  @ApiPropertyOptional({
    type: 'boolean',

    example: true,
    description: 'Indica se a categoria está ativa.',
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
