import { ApiProperty } from '@nestjs/swagger';

class EditalLookupExecutionPeriodDto {
  @ApiProperty({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Início do período de execução do edital.',
  })
  inicio!: Date;

  @ApiProperty({
    example: '2027-07-31T00:00:00.000Z',
    description: 'Fim do período de execução do edital.',
  })
  fim!: Date;
}

export class EditalLookupDto {
  @ApiProperty({ example: 1, description: 'Identificador único do edital.' })
  id!: number;

  @ApiProperty({
    example: 'EDITAL-2026-01',
    nullable: true,
    description: 'Código do edital.',
  })
  codigo!: string | null;

  @ApiProperty({
    example: 'Edital PIBIC 2026',
    description: 'Descrição do edital.',
  })
  descricao!: string;

  @ApiProperty({
    type: EditalLookupExecutionPeriodDto,
    description: 'Período de execução usado como padrão nos projetos.',
  })
  periodo_execucao_rel!: EditalLookupExecutionPeriodDto;

  @ApiProperty({
    example: 'EDITAL-2026-01 - Edital PIBIC 2026',
    description: 'Nome exibido em listas e selects.',
  })
  name!: string;
}
