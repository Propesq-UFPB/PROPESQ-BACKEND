import { ApiProperty } from '@nestjs/swagger';

export class Schedule {
  @ApiProperty({
    example: 1,
    description: 'ID único do cronograma',
  })
  id: number;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Data de início do cronograma',
    type: 'string',
    format: 'date',
  })
  data_inicio: Date;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Data de fim do cronograma',
    type: 'string',
    format: 'date',
  })
  data_fim: Date;

  @ApiProperty({
    example: 1,
    description: 'ID da atividade associada ao cronograma',
  })
  atividade_id: number;
}
