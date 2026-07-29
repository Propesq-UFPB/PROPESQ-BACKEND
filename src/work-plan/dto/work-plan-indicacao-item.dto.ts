import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StatusIndicacaoPlano,
  StatusInteressePlano,
  StatusTermoCompromisso,
  TipoIndicacao,
} from '@prisma/client';

export class EditalResumoDto {
  @ApiPropertyOptional({ nullable: true })
  id!: number | null;

  @ApiPropertyOptional({ nullable: true })
  codigo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  descricao!: string | null;
}

export class DadosBancariosResumoDto {
  @ApiProperty()
  banco!: string;

  @ApiProperty()
  agencia!: string;

  @ApiProperty()
  conta!: string;
}

export class CandidatoResumoDto {
  @ApiProperty({ description: 'ID do registro de interesse.' })
  id!: number;

  @ApiProperty()
  discente_id!: number;

  @ApiProperty()
  usuario_id!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  matricula!: string | null;

  @ApiPropertyOptional({ nullable: true })
  curso!: string | null;

  @ApiProperty({ description: 'Data/hora do registro de interesse (ISO).' })
  interesse_em!: string;

  @ApiProperty({ enum: StatusInteressePlano })
  status_interesse!: StatusInteressePlano;
}

export class WorkPlanIndicacaoItemDto {
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

  @ApiPropertyOptional({ type: CandidatoResumoDto, nullable: true })
  aluno_indicado!: CandidatoResumoDto | null;

  @ApiPropertyOptional({ type: DadosBancariosResumoDto, nullable: true })
  dados_bancarios!: DadosBancariosResumoDto | null;

  @ApiProperty({ type: [CandidatoResumoDto] })
  candidatos!: CandidatoResumoDto[];

  @ApiProperty()
  total_candidatos!: number;
}
