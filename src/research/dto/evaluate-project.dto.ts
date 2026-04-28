import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SituacaoProjeto } from '@prisma/client';
import { IsIn, IsOptional, IsString } from 'class-validator';

const ALLOWED_EVALUATE_STATUS = [
  SituacaoProjeto.APROVADO,
  SituacaoProjeto.REPROVADO,
  SituacaoProjeto.NECESSITA_CORRECAO,
] as const;

type AllowedStatus = (typeof ALLOWED_EVALUATE_STATUS)[number];

export class EvaluateProjectDto {
  @ApiProperty({
    enum: ALLOWED_EVALUATE_STATUS,
    description: 'Decisão da avaliação',
    example: SituacaoProjeto.APROVADO,
  })
  @IsIn(ALLOWED_EVALUATE_STATUS, {
    message: 'O status deve ser APROVADO, REPROVADO ou NECESSITA_CORRECAO.',
  })
  status!: AllowedStatus;

  @ApiPropertyOptional({ description: 'Feedback ou observações do coordenador' })
  @IsOptional()
  @IsString({ message: 'A observação deve ser um texto.' })
  observacao?: string;
}
