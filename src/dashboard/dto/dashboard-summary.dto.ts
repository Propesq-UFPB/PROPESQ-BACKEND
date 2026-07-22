import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisDto {
  @ApiProperty({ example: 1 })
  projetosAtivos!: number;

  @ApiProperty({ example: 1 })
  editaisEmAndamento!: number;

  @ApiProperty({ example: 1 })
  bolsistasVinculados!: number;

  @ApiProperty({ example: 2 })
  relatoriosPendentes!: number;

  @ApiProperty({ example: 2 })
  certificadosEmitidos!: number;
}

export class DashboardDeadlineDto {
  @ApiProperty({ example: 'EDITAL_EXECUCAO' })
  type!: string;

  @ApiProperty({ example: 'Encerramento da execução — Edital seed' })
  title!: string;

  @ApiProperty({ example: 1 })
  entityId!: number;

  @ApiProperty({
    example: 'edital',
    enum: ['edital', 'cota_bolsa', 'projeto_pesquisa', 'relatorio'],
  })
  entityType!: 'edital' | 'cota_bolsa' | 'projeto_pesquisa' | 'relatorio';

  @ApiProperty({ example: '2026-08-15' })
  dueDate!: string;

  @ApiProperty({ example: 25 })
  daysRemaining!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: '2026-07-21T21:00:00.000Z' })
  generatedAt!: string;

  @ApiProperty({ type: DashboardKpisDto })
  kpis!: DashboardKpisDto;

  @ApiProperty({ type: [DashboardDeadlineDto] })
  upcomingDeadlines!: DashboardDeadlineDto[];
}
