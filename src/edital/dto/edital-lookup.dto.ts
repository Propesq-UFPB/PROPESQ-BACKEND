import { ApiProperty } from '@nestjs/swagger';

export class EditalLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único do edital.' })
  id!: number;

  @ApiProperty({
    example: 'EDITAL-2026-01',
    nullable: true,
    description: 'Código do edital.',
  })
  codigo!: string | null;

  @ApiProperty({
    example: 'Edital PIBIC 2026',
    description: 'Descrição do edital.',
  })
  descricao!: string;

  @ApiProperty({
    example: 'EDITAL-2026-01 - Edital PIBIC 2026',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
