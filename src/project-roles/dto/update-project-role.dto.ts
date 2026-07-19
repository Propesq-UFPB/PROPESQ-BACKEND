import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaFuncaoProjeto } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProjectRoleDto {
  @ApiPropertyOptional({
    type: 'string',
    maxLength: 255,
    example: 'Orientador',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome?: string;

  @ApiPropertyOptional({
    enum: CategoriaFuncaoProjeto,
    example: CategoriaFuncaoProjeto.ACADEMICO,
  })
  @IsOptional()
  @IsEnum(CategoriaFuncaoProjeto, { message: 'A categoria é inválida.' })
  categoria?: CategoriaFuncaoProjeto;

  @ApiPropertyOptional({
    type: 'string',
    example: 'Docente responsável pela orientação do projeto.',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  descricao?: string | null;

  @ApiPropertyOptional({ example: true, description: 'Indica se a função está ativa.' })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo?: boolean;
}
