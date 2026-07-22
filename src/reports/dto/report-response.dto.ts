import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusRelatorio, TipoRelatorio } from '@prisma/client';

export class ReportResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  projeto_pesquisa_id!: number;

  @ApiProperty({ enum: TipoRelatorio })
  tipo!: TipoRelatorio;

  @ApiProperty({ enum: StatusRelatorio })
  status!: StatusRelatorio;

  @ApiProperty({ example: '2026-08-20' })
  prazo_fim!: string;

  @ApiPropertyOptional({ example: '2026-08-10T12:00:00.000Z', nullable: true })
  enviado_em!: string | null;

  @ApiProperty({ example: '2026-07-21T00:00:00.000Z' })
  criado_em!: string;
}
