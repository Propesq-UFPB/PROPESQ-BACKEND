import { StatusEdital } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class EditalListItemDto {
  @ApiProperty({ example: 1, description: 'Identificador único do edital.' })
  id!: number;

  @ApiProperty({
    example: 'Edital PIBIC 2026',
    description: 'Título do edital.',
  })
  titulo!: string;

  @ApiProperty({
    example: '01/08/2026 a 31/07/2027',
    description: 'Período de execução do projeto formatado.',
  })
  periodo_execucao!: string;

  @ApiProperty({
    enum: StatusEdital,
    example: StatusEdital.PUBLICADO,
    description: 'Status atual do edital.',
  })
  status!: StatusEdital;
}
