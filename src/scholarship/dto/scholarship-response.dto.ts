import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScholarshipOrgaoSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'CNPq' })
  nome!: string;
}

export class ScholarshipResponseDto {
  @ApiProperty({ example: 1, description: 'Identificador único da bolsa.' })
  id!: number;

  @ApiProperty({ example: 'Bolsa de Iniciação Científica', description: 'Descrição da bolsa.' })
  descricao!: string;

  @ApiProperty({ example: 'PIBIC', description: 'Categoria da bolsa.' })
  categoria!: string;

  @ApiProperty({ example: 15, description: 'Dia limite para indicação.' })
  dia_limite_indicacao!: number;

  @ApiProperty({ example: 20, description: 'Dia limite para finalização.' })
  dia_limite_finalizacao!: number;

  @ApiProperty({
    example: '101',
    description: 'Máscara de 3 bits para níveis habilitados.',
  })
  niveis!: string;

  @ApiProperty({ example: true, description: 'Indica se a bolsa está vinculada a cota.' })
  vinculado_cota!: boolean;

  @ApiProperty({ example: true, description: 'Indica se a bolsa necessita relatório.' })
  necessita_relatorio!: boolean;

  @ApiProperty({ example: false, description: 'Indica se a bolsa necessita dados bancários.' })
  necessidade_dados_bancarios!: boolean;

  @ApiProperty({ example: false, description: 'Indica se a bolsa possui bancos exclusivos.' })
  possui_bancos_exclusivos!: boolean;

  @ApiProperty({ example: false, description: 'Indica se a bolsa possui tipo de conta exclusivo.' })
  possui_tipo_conta_excls!: boolean;

  @ApiProperty({
    example: '2026-01-01',
    format: 'date',
    description: 'Início do envio de relatório.',
  })
  envio_relatorio_inicio!: string;

  @ApiProperty({ example: '2026-12-31', format: 'date', description: 'Fim do envio de relatório.' })
  envio_relatorio_fim!: string;

  @ApiPropertyOptional({
    example: 1,
    nullable: true,
    description: 'ID do órgão financiador.',
  })
  orgao_id!: number | null;

  @ApiPropertyOptional({
    example: 700,
    nullable: true,
    description: 'Valor mensal da bolsa.',
  })
  valor!: number | null;

  @ApiProperty({ example: false, description: 'Indica se a bolsa permite acúmulo.' })
  permite_acumulo!: boolean;

  @ApiPropertyOptional({
    type: ScholarshipOrgaoSummaryDto,
    nullable: true,
    description: 'Órgão financiador associado.',
  })
  orgao!: ScholarshipOrgaoSummaryDto | null;
}
