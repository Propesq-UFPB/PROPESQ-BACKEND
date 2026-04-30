import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SituacaoProjeto } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const ALLOWED_FINAL_STATUS = [SituacaoProjeto.APROVADO, SituacaoProjeto.REPROVADO] as const;

type FinalStatus = (typeof ALLOWED_FINAL_STATUS)[number];

export class FinalDecisionDto {
  @ApiProperty({
    enum: ALLOWED_FINAL_STATUS,
    description: 'Decisão final do gestor (Aprovado ou Reprovado)',
    example: SituacaoProjeto.APROVADO,
  })
  @IsEnum(SituacaoProjeto, {
    message: 'A situação deve ser estritamente APROVADO ou REPROVADO.',
  })
  situacao!: FinalStatus;

  @ApiPropertyOptional({ description: 'Feedback final ou justificativa' })
  @IsOptional()
  @IsString({ message: 'A justificativa deve ser um texto.' })
  justificativa?: string;

  @ApiPropertyOptional({ description: 'Pontuação final do projeto para efeitos de ranking' })
  @IsOptional()
  @IsNumber({}, { message: 'A pontuação deve ser um número.' })
  @Min(0, { message: 'A pontuação não pode ser negativa.' })
  pontuacao_final?: number;
}
