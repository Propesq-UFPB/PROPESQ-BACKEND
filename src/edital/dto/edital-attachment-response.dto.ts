import { ApiProperty } from '@nestjs/swagger';

export class EditalAttachmentResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único do anexo.' })
  id!: number;

  @ApiProperty({ example: 10, description: 'Identificador do edital vinculado ao anexo.' })
  edital_id!: number;

  @ApiProperty({
    example: 'edital.pdf-a1b2c3d4e5f67890',
    description: 'Nome original do arquivo com sufixo aleatório.',
  })
  nome!: string;

  @ApiProperty({ example: 'pdf', description: 'Extensão do arquivo enviado.' })
  tipo!: string;
}
