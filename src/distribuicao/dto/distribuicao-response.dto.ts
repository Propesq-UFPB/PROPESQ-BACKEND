import { ApiProperty } from '@nestjs/swagger';
import { SituacaoProjeto, StatusAtribuicao } from '@prisma/client';
import { AreaConhecimentoDto } from '../../consultor/dto/consultor-response.dto';

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

  @ApiProperty({ description: 'Convite já existente (pendente ou aceito), mantido pela prévia' })
  existente: boolean;

  @ApiProperty({ type: Number, nullable: true })
  atribuicao_id: number | null;

  @ApiProperty({ enum: StatusAtribuicao, nullable: true, description: 'Nulo para sugestões novas' })
  status: StatusAtribuicao | null;

  @ApiProperty({ description: 'Possui notas lançadas (não pode ser removida)' })
  tem_notas: boolean;
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

export class ProjetoPanoramaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty({ enum: SituacaoProjeto })
  situacao: SituacaoProjeto;

  @ApiProperty({ type: String, nullable: true })
  coordenador: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Sigla da unidade acadêmica' })
  unidade: string | null;

  @ApiProperty({ type: AreaConhecimentoDto, nullable: true })
  area_conhecimento: AreaConhecimentoDto | null;
}

export class AtribuicaoPanoramaDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  projeto_id: number;

  @ApiProperty({ type: Number, nullable: true })
  consultor_id: number | null;

  @ApiProperty()
  avaliador_id: number;

  @ApiProperty()
  avaliador_nome: string;

  @ApiProperty({ enum: StatusAtribuicao })
  status: StatusAtribuicao;

  @ApiProperty({ type: String, nullable: true })
  motivo_recusa: string | null;

  @ApiProperty()
  tem_notas: boolean;

  @ApiProperty({ description: 'Data do envio do convite' })
  criado_em: Date;

  @ApiProperty({ type: Date, nullable: true })
  respondido_em: Date | null;
}

export class DistribuicaoPanoramaDto {
  @ApiProperty({ type: [ProjetoPanoramaDto] })
  projetos: ProjetoPanoramaDto[];

  @ApiProperty({ type: [AtribuicaoPanoramaDto] })
  atribuicoes: AtribuicaoPanoramaDto[];
}

export class MinhaAtribuicaoProjetoDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty({ type: AreaConhecimentoDto, nullable: true })
  area_conhecimento: AreaConhecimentoDto | null;
}

export class MinhaAtribuicaoEditalDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: String, nullable: true })
  codigo: string | null;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  ano: number;
}

export class MinhaAtribuicaoDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: StatusAtribuicao })
  status: StatusAtribuicao;

  @ApiProperty({ type: String, nullable: true })
  motivo_recusa: string | null;

  @ApiProperty({ description: 'Possui notas lançadas (avaliação realizada)' })
  tem_notas: boolean;

  @ApiProperty({ description: 'Data do envio do convite' })
  criado_em: Date;

  @ApiProperty({ type: Date, nullable: true })
  respondido_em: Date | null;

  @ApiProperty({ type: MinhaAtribuicaoProjetoDto })
  projeto: MinhaAtribuicaoProjetoDto;

  @ApiProperty({ type: MinhaAtribuicaoEditalDto, nullable: true })
  edital: MinhaAtribuicaoEditalDto | null;
}

export class AtribuicaoRespostaDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: StatusAtribuicao })
  status: StatusAtribuicao;

  @ApiProperty({ type: String, nullable: true })
  motivo_recusa: string | null;

  @ApiProperty({ type: Date, nullable: true })
  respondido_em: Date | null;
}
