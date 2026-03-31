import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAcademicUnitDto {
  @ApiProperty({ type: 'string', maxLength: 15, required: true, example: 'CCS' })
  @IsNotEmpty({ message: 'A sigla é obrigatória.' })
  @IsString({ message: 'A sigla deve ser um texto.' })
  @MaxLength(15, { message: 'A sigla deve ter no máximo 15 caracteres.' })
  sigla!: string;

  @ApiProperty({
    type: 'string',
    maxLength: 255,
    required: true,
    example: 'Centro de Ciências da Saúde',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  nome!: string;
}
