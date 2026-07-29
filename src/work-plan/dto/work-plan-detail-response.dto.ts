import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkPlanMonthResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  data!: Date;
}

export class WorkPlanActivityResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  descricao!: string;

  @ApiProperty({ type: [WorkPlanMonthResponseDto] })
  meses!: WorkPlanMonthResponseDto[];
}

export class WorkPlanBodyResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  titulo!: string;

  @ApiProperty()
  introducao!: string;

  @ApiProperty()
  objetivos!: string;

  @ApiProperty()
  metodologia!: string;

  @ApiProperty()
  referencias!: string;

  @ApiProperty()
  plano_trabalho_id!: number;
}

export class WorkPlanProjetoResumoDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  codigo!: string;

  @ApiProperty()
  titulo!: string;
}

/**
 * Contrato Swagger do GET /work-plans/:id.
 * Shape runtime permanece o include Prisma + atividades anexadas.
 */
export class WorkPlanDetailResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  pesquisa_id!: number;

  @ApiPropertyOptional({ nullable: true })
  discente_id!: number | null;

  @ApiPropertyOptional({ nullable: true })
  usuario_id!: number | null;

  @ApiProperty()
  modalidade!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  tipo_bolsa!: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Legado. Planos novos têm null (recurso de cronograma removido). Valores antigos podem existir.',
  })
  cronograma_id!: number | null;

  @ApiProperty()
  direcionamento_plano!: string;

  @ApiPropertyOptional({ nullable: true })
  corpo_id!: number | null;

  @ApiPropertyOptional({ type: WorkPlanBodyResponseDto, nullable: true })
  corpo_plano_trabalho!: WorkPlanBodyResponseDto | null;

  @ApiPropertyOptional({ type: WorkPlanProjetoResumoDto, nullable: true })
  projeto_pesquisa!: WorkPlanProjetoResumoDto | null;

  @ApiProperty({ type: [WorkPlanActivityResponseDto] })
  atividades!: WorkPlanActivityResponseDto[];
}
