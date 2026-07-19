import { ApiProperty } from '@nestjs/swagger';

export class ProjectRoleLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único da função de projeto.' })
  id!: number;

  @ApiProperty({
    example: 'Orientador',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
