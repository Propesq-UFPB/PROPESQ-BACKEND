import { ApiProperty } from '@nestjs/swagger';

export enum KnowledgeAreaLookupLevel {
  GRANDE_AREA = 'GRANDE_AREA',
  AREA = 'AREA',
  SUB_AREA = 'SUB_AREA',
  ESPECIALIDADE = 'ESPECIALIDADE',
}

export class KnowledgeAreaLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador da classificação no sistema.' })
  id!: number;

  @ApiProperty({ example: 'Ciências Agrárias', description: 'Nome exibido no select.' })
  name!: string;

  @ApiProperty({
    enum: KnowledgeAreaLookupLevel,
    example: KnowledgeAreaLookupLevel.GRANDE_AREA,
    description: 'Nível hierárquico retornado pelo lookup.',
  })
  level!: KnowledgeAreaLookupLevel;
}
