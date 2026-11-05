import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';

export class UpdateMinhasAreasDto {
  @ApiProperty({ example: 345, description: 'Área de conhecimento principal.' })
  @IsInt({ message: 'A área principal deve ser um número inteiro.' })
  area_principal_id!: number;

  @ApiProperty({
    type: [Number],
    example: [346, 400],
    description: 'Áreas de conhecimento secundárias. Substitui a lista atual.',
  })
  @IsArray({ message: 'As áreas secundárias devem ser uma lista.' })
  @ArrayUnique({ message: 'As áreas secundárias não podem se repetir.' })
  @IsInt({ each: true, message: 'Cada área secundária deve ser um número inteiro.' })
  areas_adicionais_ids!: number[];
}
