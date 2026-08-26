import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResearchProjectBodyDto {
  @ApiProperty()
  @IsString({ message: 'O resumo deve ser um texto' })
  @IsNotEmpty({ message: 'O resumo é obrigatório' })
  resumo!: string;

  @ApiProperty()
  @IsString({ message: 'O abstract deve ser um texto' })
  @IsNotEmpty({ message: 'O abstract é obrigatório' })
  abstract!: string;

  @ApiProperty()
  @IsString({ message: 'A introdução deve ser um texto' })
  @IsNotEmpty({ message: 'A introdução é obrigatória' })
  introducao!: string;

  @ApiProperty()
  @IsString({ message: 'Os objetivos devem ser um texto' })
  @IsNotEmpty({ message: 'Os objetivos são obrigatórios' })
  objetivos!: string;

  @ApiProperty()
  @IsString({ message: 'A metodologia deve ser um texto' })
  @IsNotEmpty({ message: 'A metodologia é obrigatória' })
  metodologia!: string;

  @ApiProperty()
  @IsString({ message: 'Os resultados esperados devem ser um texto' })
  @IsNotEmpty({ message: 'Os resultados esperados são obrigatórios' })
  resultados_esperados!: string;

  @ApiProperty()
  @IsString({ message: 'As referências devem ser um texto' })
  @IsNotEmpty({ message: 'As referências são obrigatórias' })
  referencias!: string;
}

export class UpdateResearchProjectBodyDto extends PartialType(CreateResearchProjectBodyDto) {}
