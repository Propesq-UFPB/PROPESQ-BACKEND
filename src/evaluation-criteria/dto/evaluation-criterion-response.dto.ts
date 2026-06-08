import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluationCriterionResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único do critério.' })
  id!: number;

  @ApiProperty({ example: 'Metodologia', description: 'Nome do critério de avaliação.' })
  nome!: string;

  @ApiPropertyOptional({
    example: 'Avalia a adequação da metodologia proposta.',
    description: 'Descrição detalhada do critério.',
  })
  descricao!: string | null;

  @ApiProperty({ example: 0.3, description: 'Peso do critério na nota final.' })
  peso!: number;

  @ApiProperty({ example: 10, description: 'Nota máxima atribuível a este critério.' })
  nota_maxima!: number;

  @ApiProperty({ example: true, description: 'Indica se o critério está ativo.' })
  ativo!: boolean;

  @ApiProperty({ example: '2026-06-06T12:00:00.000Z', description: 'Data de criação.' })
  criado_em!: Date;

  @ApiProperty({ example: '2026-06-06T12:00:00.000Z', description: 'Data da última atualização.' })
  atualizado_em!: Date;

  @ApiPropertyOptional({
    example: null,
    description: 'Data de desativação (null se ativo).',
  })
  desativado_em!: Date | null;
}
