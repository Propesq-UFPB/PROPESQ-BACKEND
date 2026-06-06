import { ApiProperty } from '@nestjs/swagger';

export class EvaluationCriterionLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador do critério.' })
  id!: number;

  @ApiProperty({ example: 'Metodologia', description: 'Nome do critério.' })
  name!: string;
}
