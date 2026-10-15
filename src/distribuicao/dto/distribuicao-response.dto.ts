import { ApiProperty } from '@nestjs/swagger';

export class AtribuicaoPreviewDto {
  @ApiProperty()
  projeto_id: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Nulo apenas em atribuições antigas cujo avaliador não é consultor do edital',
  })
  consultor_id: number | null;

  @ApiProperty({ description: 'Usuário avaliador' })
  avaliador_id: number;

  @ApiProperty({ description: 'Afinidade de área entre consultor e projeto' })
  score: number;

  @ApiProperty({
    description: 'Atribuição já existente com notas lançadas (não pode ser removida)',
  })
  bloqueada: boolean;
}

export class PendenciaDto {
  @ApiProperty()
  projeto_id: number;

  @ApiProperty({ description: 'Quantidade de consultores que faltam para o projeto' })
  faltando: number;
}

export class CargaConsultorDto {
  @ApiProperty()
  consultor_id: number;

  @ApiProperty()
  total: number;
}

export class DistribuicaoPreviewDto {
  @ApiProperty({ description: 'Status retornado pelo solver' })
  status: string;

  @ApiProperty({ type: [AtribuicaoPreviewDto] })
  atribuicoes: AtribuicaoPreviewDto[];

  @ApiProperty({ type: [PendenciaDto] })
  pendencias: PendenciaDto[];

  @ApiProperty({ type: [CargaConsultorDto] })
  carga: CargaConsultorDto[];
}

export class DistribuicaoConfirmResultDto {
  @ApiProperty()
  criadas: number;

  @ApiProperty()
  removidas: number;

  @ApiProperty()
  mantidas: number;
}

export class CandidatoDto {
  @ApiProperty()
  consultor_id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  score: number;

  @ApiProperty({ description: 'Projetos já atribuídos ao consultor neste edital' })
  carga: number;

  @ApiProperty({ description: 'Consultor já atribuído a este projeto' })
  atribuido: boolean;
}
