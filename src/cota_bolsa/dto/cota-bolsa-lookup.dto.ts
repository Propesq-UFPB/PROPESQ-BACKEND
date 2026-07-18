import { ApiProperty } from '@nestjs/swagger';

export class CotaBolsaLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único da cota bolsa.' })
  id!: number;

  @ApiProperty({
    example: 'PIBIC-EM-CNPq',
    nullable: true,
    description: 'Código da cota bolsa.',
  })
  codigo!: string | null;

  @ApiProperty({
    example: 'PIBIC-EM-CNPq',
    description: 'Descrição da cota bolsa.',
  })
  descricao!: string;

  @ApiProperty({
    example: '2026-2027 PIBIC-EM-CNPq',
    description: 'Nome exibido em listas e selects, com anos do período de validade.',
  })
  name!: string;
}
