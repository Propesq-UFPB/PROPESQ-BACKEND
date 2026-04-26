import { ApiProperty } from '@nestjs/swagger';

export class AcademicUnitResponseDto {
  @ApiProperty({ example: 2, description: 'Identificador único da unidade acadêmica.' })
  id!: number;

  @ApiProperty({ example: 'CCS', description: 'Sigla da unidade acadêmica.' })
  sigla!: string;

  @ApiProperty({
    example: 'Centro de Ciências da Saúde',
    description: 'Nome completo da unidade acadêmica.',
  })
  nome!: string;

  @ApiProperty({ example: true, description: 'Indica se a unidade acadêmica está ativa.' })
  ativo!: boolean;
}
