import { ApiProperty } from '@nestjs/swagger';

export class FundingAgencyResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único do órgão financiador.' })
  id!: number;

  @ApiProperty({ example: 'CNPq', description: 'Nome do órgão financiador.' })
  nome!: string;

  @ApiProperty({ example: '2026-07-14T00:00:00.000Z', description: 'Data de criação.' })
  criado_em!: string;

  @ApiProperty({ example: '2026-07-14T00:00:00.000Z', description: 'Data da última atualização.' })
  atualizado_em!: string;
}
