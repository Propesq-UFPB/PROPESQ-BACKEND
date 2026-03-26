import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAcademicUnit {
  @ApiProperty({ type: 'string', maxLength: 15, required: false })
  @IsOptional()
  @IsString({ message: 'A sigla deve ser um texto' })
  @MaxLength(15, { message: 'A sigla deve ter no máximo 15 caracteres' })
  sigla: string;

  @ApiProperty({ type: 'string', maxLength: 255, required: false })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres' })
  nome: string;

  @ApiProperty({ type: 'boolean', required: false })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso' })
  ativo: boolean;
}
