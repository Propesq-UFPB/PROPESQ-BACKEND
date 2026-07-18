import { ApiProperty } from '@nestjs/swagger';

export class CategoryLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único da categoria.' })
  id!: number;

  @ApiProperty({
    example: 'Iniciação Científica',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
