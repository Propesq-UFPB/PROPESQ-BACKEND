import { ApiProperty } from '@nestjs/swagger';

export class ScholarshipLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único da bolsa.' })
  id!: number;

  @ApiProperty({
    example: 'Bolsa de Iniciação Científica',
    description: 'Descrição exibida em listas e selects.',
  })
  descricao!: string;
}
