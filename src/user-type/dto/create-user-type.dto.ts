import { ApiProperty } from '@nestjs/swagger';
import { PublicoAlvo } from '@prisma/client';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserTypeDto {
  @ApiProperty({
    type: 'string',
    maxLength: 255,
    required: true,
    example: 'Coordenador de Projeto',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome!: string;

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
    required: true,
    example: [PublicoAlvo.DOCENTE, PublicoAlvo.TECNICO_ADMINISTRATIVO],
    description: 'Públicos que podem se enquadrar neste tipo (mínimo 1).',
  })
  @IsArray({ message: 'publicos deve ser um array.' })
  @ArrayMinSize(1, { message: 'Selecione pelo menos um público.' })
  @ArrayUnique({ message: 'publicos não pode conter valores duplicados.' })
  @IsEnum(PublicoAlvo, { each: true, message: 'Público inválido.' })
  publicos!: PublicoAlvo[];
}
