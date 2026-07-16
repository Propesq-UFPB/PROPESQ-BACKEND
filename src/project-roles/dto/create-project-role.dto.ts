import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaFuncaoProjeto } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectRoleDto {
  @ApiProperty({
    type: 'string',
    maxLength: 255,
    required: true,
    example: 'Orientador',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome!: string;

  @ApiProperty({
    enum: CategoriaFuncaoProjeto,
    example: CategoriaFuncaoProjeto.ACADEMICO,
  })
  @IsEnum(CategoriaFuncaoProjeto, { message: 'A categoria é inválida.' })
  categoria!: CategoriaFuncaoProjeto;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Docente responsável pela orientação do projeto.',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string;

  @ApiPropertyOptional({ example: true, description: 'Indica se a função está ativa.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
