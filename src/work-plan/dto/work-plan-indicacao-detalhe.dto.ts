import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StatusIndicacaoPlano,
  StatusTermoCompromisso,
  TipoIndicacao,
} from '@prisma/client';
import { CandidatoDetalheDto } from './candidato-detalhe.dto';
import {
  DadosBancariosResumoDto,
  EditalResumoDto,
} from './work-plan-indicacao-item.dto';

/** Shape do GET /work-plans/indicacoes/:id (candidatos enriquecidos). */
export class WorkPlanIndicacaoDetalheDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  pesquisa_id!: number;

  @ApiProperty()
  projeto_titulo!: string;

  @ApiPropertyOptional({ nullable: true })
  plano_titulo!: string | null;

  @ApiProperty({ type: EditalResumoDto })
  edital!: EditalResumoDto;

  @ApiPropertyOptional({ nullable: true })
  ano!: string | null;

  @ApiPropertyOptional({ nullable: true })
  area!: string | null;

  @ApiProperty()
  modalidade!: string;

  @ApiProperty()
  vagas!: number;

  @ApiPropertyOptional({ nullable: true })
  carga_horaria!: number | null;

  @ApiProperty({ enum: StatusIndicacaoPlano })
  status_indicacao!: StatusIndicacaoPlano;

  @ApiPropertyOptional({ nullable: true })
  aprovado_em!: string | null;

  @ApiPropertyOptional({ nullable: true })
  vigencia_inicio!: string | null;

  @ApiPropertyOptional({ nullable: true })
  vigencia_fim!: string | null;

  @ApiPropertyOptional({ nullable: true })
  prazo_indicacao!: string | null;

  @ApiPropertyOptional({ nullable: true })
  prazo_substituicao!: string | null;

  @ApiPropertyOptional({ enum: StatusTermoCompromisso, nullable: true })
  status_termo_compromisso!: StatusTermoCompromisso | null;

  @ApiPropertyOptional({ enum: TipoIndicacao, nullable: true })
  tipo_indicacao!: TipoIndicacao | null;

  @ApiPropertyOptional({ type: CandidatoDetalheDto, nullable: true })
  aluno_indicado!: CandidatoDetalheDto | null;

  @ApiPropertyOptional({ type: DadosBancariosResumoDto, nullable: true })
  dados_bancarios!: DadosBancariosResumoDto | null;

  @ApiProperty({ type: [CandidatoDetalheDto] })
  candidatos!: CandidatoDetalheDto[];

  @ApiProperty()
  total_candidatos!: number;
}
