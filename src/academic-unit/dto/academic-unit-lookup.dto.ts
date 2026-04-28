import { ApiProperty } from '@nestjs/swagger';

export class AcademicUnitLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único da unidade acadêmica.' })
  id!: number;

  @ApiProperty({
    example: 'Centro de Ciências da Saúde',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
