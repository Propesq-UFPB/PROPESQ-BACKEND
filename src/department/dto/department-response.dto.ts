import { ApiProperty } from '@nestjs/swagger';

export class DepartmentResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único do departamento.' })
  id!: number;

  @ApiProperty({ example: 'DCC', description: 'Sigla do departamento.' })
  sigla!: string;

  @ApiProperty({
    example: 'Departamento de Ciência da Computação',
    description: 'Nome completo do departamento.',
  })
  nome!: string;

  @ApiProperty({ example: true, description: 'Indica se o departamento está ativo.' })
  ativo!: boolean;

  @ApiProperty({ example: 2, description: 'Identificador da unidade acadêmica pai.' })
  unidade_id!: number;
}
