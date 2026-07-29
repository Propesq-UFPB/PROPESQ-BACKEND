import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusInteressePlano } from '@prisma/client';
import { CandidatoResumoDto } from './work-plan-indicacao-item.dto';

export class CandidatoDocumentosDto {
  @ApiPropertyOptional({ nullable: true })
  cpf!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rg!: string | null;

  @ApiPropertyOptional({ nullable: true })
  rg_emissao!: string | null;

  @ApiPropertyOptional({ nullable: true })
  orgao_emissor!: string | null;

  @ApiPropertyOptional({ nullable: true })
  titulo_eleitor!: string | null;

  @ApiPropertyOptional({ nullable: true })
  zona_eleitoral!: string | null;

  @ApiPropertyOptional({ nullable: true })
  secao_eleitoral!: string | null;

  @ApiPropertyOptional({ nullable: true })
  certificado_militar!: string | null;

  @ApiPropertyOptional({ nullable: true })
  categoria_militar!: string | null;
}

export class CandidatoEnderecoDto {
  @ApiPropertyOptional({ nullable: true })
  cep!: string | null;

  @ApiPropertyOptional({ nullable: true })
  tipo_logradouro!: string | null;

  @ApiPropertyOptional({ nullable: true })
  logradouro!: string | null;

  @ApiPropertyOptional({ nullable: true })
  numero!: string | null;

  @ApiPropertyOptional({ nullable: true })
  complemento!: string | null;

  @ApiPropertyOptional({ nullable: true })
  bairro!: string | null;

  @ApiPropertyOptional({ nullable: true })
  uf!: string | null;

  @ApiPropertyOptional({ nullable: true })
  cidade!: string | null;

  @ApiPropertyOptional({ nullable: true })
  pais!: string | null;
}

export class CandidatoContatoDto {
  @ApiPropertyOptional({ nullable: true })
  telefone_ddd!: string | null;

  @ApiPropertyOptional({ nullable: true })
  telefone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  celular_ddd!: string | null;

  @ApiPropertyOptional({ nullable: true })
  celular!: string | null;

  @ApiProperty()
  email!: string;
}

export class CandidatoAcademicoDto {
  @ApiPropertyOptional({ nullable: true })
  curso!: string | null;

  @ApiPropertyOptional({ nullable: true })
  campus!: string | null;

  @ApiPropertyOptional({ nullable: true })
  periodo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  semestre!: string | null;

  @ApiPropertyOptional({ nullable: true })
  cra!: string | null;

  @ApiPropertyOptional({ nullable: true })
  creditos_concluidos!: number | null;

  @ApiPropertyOptional({ nullable: true })
  reprovacoes!: number | null;

  @ApiPropertyOptional({ nullable: true })
  situacao_academica!: string | null;

  @ApiPropertyOptional({ nullable: true })
  situacao_matricula!: string | null;
}

export class CandidatoNecessidadeDto {
  @ApiProperty()
  possui!: boolean;

  @ApiPropertyOptional({ nullable: true })
  tipo!: string | null;
}

export class CandidatoDetalheDto extends CandidatoResumoDto {
  @ApiPropertyOptional({ nullable: true })
  lattes_url!: string | null;

  @ApiPropertyOptional({ nullable: true })
  data_nascimento!: string | null;

  @ApiPropertyOptional({ nullable: true })
  sexo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  raca!: string | null;

  @ApiPropertyOptional({ nullable: true })
  estado_civil!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nacionalidade!: string | null;

  @ApiPropertyOptional({ nullable: true })
  naturalidade!: string | null;

  @ApiPropertyOptional({ nullable: true })
  tipo_sanguineo!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nome_pai!: string | null;

  @ApiPropertyOptional({ nullable: true })
  nome_mae!: string | null;

  @ApiPropertyOptional({ type: CandidatoDocumentosDto, nullable: true })
  documentos!: CandidatoDocumentosDto | null;

  @ApiPropertyOptional({ type: CandidatoEnderecoDto, nullable: true })
  endereco!: CandidatoEnderecoDto | null;

  @ApiPropertyOptional({ type: CandidatoContatoDto, nullable: true })
  contato!: CandidatoContatoDto | null;

  @ApiPropertyOptional({ type: CandidatoAcademicoDto, nullable: true })
  academico!: CandidatoAcademicoDto | null;

  @ApiPropertyOptional({ type: CandidatoNecessidadeDto, nullable: true })
  necessidade_especifica!: CandidatoNecessidadeDto | null;

  @ApiProperty({ enum: StatusInteressePlano })
  declare status_interesse: StatusInteressePlano;
}
