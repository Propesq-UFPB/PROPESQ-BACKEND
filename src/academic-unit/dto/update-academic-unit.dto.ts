import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAcademicUnitDto {
  @ApiProperty({ type: 'string', maxLength: 15, required: false, example: 'CCS' })
  @IsOptional()
  @IsString({ message: 'A sigla deve ser um texto.' })
  @IsNotEmpty({ message: 'A sigla não pode ser vazia.' })
  @MaxLength(15, { message: 'A sigla deve ter no máximo 15 caracteres.' })
  sigla!: string;

  @ApiProperty({
    type: 'string',
    maxLength: 255,
    required: false,
    example: 'Centro de Ciências da Saúde',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome!: string;

  @ApiProperty({ type: 'boolean', required: false, example: true })
  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser verdadeiro ou falso.' })
  ativo!: boolean;
}
