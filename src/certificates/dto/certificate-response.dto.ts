import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificateResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  usuario_id!: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  projeto_pesquisa_id!: number | null;

  @ApiProperty({ example: 'Participação como Bolsista' })
  tipo!: string;

  @ApiProperty({ example: 'CERT-2026-001' })
  codigo!: string;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  emitido_em!: string;

  @ApiProperty({ example: '2026-07-21T00:00:00.000Z' })
  criado_em!: string;

  @ApiProperty({ example: 'Usuario Aluno' })
  usuario_nome!: string;
}
