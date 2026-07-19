import { ApiProperty } from '@nestjs/swagger';

export class UserTypeLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único do tipo de usuário.' })
  id!: number;

  @ApiProperty({
    example: 'Coordenador de Projeto',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
