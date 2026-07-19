import { ApiProperty } from '@nestjs/swagger';
import { PublicoAlvo } from '@prisma/client';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserTypeDto {
  @ApiProperty({
    type: 'string',
    maxLength: 255,
    required: false,
    example: 'Coordenador de Projeto',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome?: string;

  @ApiProperty({
    type: 'string',
    required: false,
    example: 'Pode criar/gerenciar projetos e submeter propostas em editais.',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string;

  @ApiProperty({
    enum: PublicoAlvo,
    isArray: true,
    required: false,
    example: [PublicoAlvo.DOCENTE],
  })
  @IsOptional()
  @IsArray({ message: 'publicos deve ser um array.' })
  @ArrayMinSize(1, { message: 'Selecione pelo menos um público.' })
  @ArrayUnique({ message: 'publicos não pode conter valores duplicados.' })
  @IsEnum(PublicoAlvo, { each: true, message: 'Público inválido.' })
  publicos?: PublicoAlvo[];

  @ApiProperty({ type: 'boolean', required: false, example: true })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
