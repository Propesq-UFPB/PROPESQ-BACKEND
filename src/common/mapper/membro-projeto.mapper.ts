import {
  MembroExternoFormacao,
  TipoMembroExterno,
  TipoMembroProjeto,
  TipoSexo,
} from '@prisma/client';

export const TipoMembroProjetoMapper: Record<TipoMembroProjeto, string> = {
  [TipoMembroProjeto.COORDENADOR]: 'Coordenador',
  [TipoMembroProjeto.COORDENADOR_ADJ]: 'Coordenador adjunto',
  [TipoMembroProjeto.COLABORADOR]: 'Colaborador',
};

export const TipoSexoMapper: Record<TipoSexo, string> = {
  [TipoSexo.MASCULINO]: 'Masculino',
  [TipoSexo.FEMININO]: 'Feminino',
};

export const MembroExternoFormacaoMapper: Record<MembroExternoFormacao, string> = {
  [MembroExternoFormacao.NAO_INFORMADA]: 'Não informada',
  [MembroExternoFormacao.TECNICO_PROFISSIONALIZANTE_ENS_MEDIO]:
    'Técnico profissionalizante (ensino médio)',
  [MembroExternoFormacao.POS_TECNICO]: 'Pós-técnico',
  [MembroExternoFormacao.GRADUACAO]: 'Graduação',
  [MembroExternoFormacao.ENSINO_FUNDAMENTAL_INCOMPLETO]: 'Ensino fundamental incompleto',
  [MembroExternoFormacao.ENSINO_FUNDAMENTAL]: 'Ensino fundamental',
  [MembroExternoFormacao.ENSINO_MEDIO_INCOMPLETO]: 'Ensino médio incompleto',
  [MembroExternoFormacao.ENSINO_MEDIO]: 'Ensino médio',
  [MembroExternoFormacao.APERFEICOAMENTO]: 'Aperfeiçoamento',
  [MembroExternoFormacao.ESPECIALIZACAO]: 'Especialização',
  [MembroExternoFormacao.MESTRADO]: 'Mestrado',
  [MembroExternoFormacao.SEQUENCIAL]: 'Sequencial',
  [MembroExternoFormacao.POS_DOUTORADO]: 'Pós-doutorado',
  [MembroExternoFormacao.DESCONHECIDA]: 'Desconhecida',
  [MembroExternoFormacao.TECNOLOGO_DE_NIVEL_SUPERIOR]: 'Tecnólogo de nível superior',
  [MembroExternoFormacao.DOUTORADO]: 'Doutorado',
};

export const TipoMembroExternoMapper: Record<TipoMembroExterno, string> = {
  [TipoMembroExterno.NAO_INFORMADO]: 'Não informado',
  [TipoMembroExterno.PESQUISADOR_VISITANTE_DA_ANP]: 'Pesquisador visitante da ANP',
  [TipoMembroExterno.COLABORADOR_VOLUNTARIO_ANTIGO_ASSOCIADO]:
    'Colaborador voluntário (antigo associado)',
  [TipoMembroExterno.PROFESSOR_VISITANTE]: 'Professor visitante',
  [TipoMembroExterno.PESQUISADOR_VISITANTE_BOLSA_DCR]: 'Pesquisador visitante com bolsa DCR',
  [TipoMembroExterno.PROFESSOR_EM_CONVENIO_DE_COLABORACAO_TECNICA]:
    'Professor em convênio de colaboração técnica',
  [TipoMembroExterno.PESQUISADOR_VISITANTE_COM_BOLSA_FAPESQ]:
    'Pesquisador visitante com bolsa FAPESQ',
  [TipoMembroExterno.PESQUISADOR_VISITANTE_COM_BOLSA]: 'Pesquisador visitante com bolsa',
  [TipoMembroExterno.PESQUISADOR_VISITANTE_COM_BOLSA_PRODOC_CAPES]:
    'Pesquisador visitante com bolsa PRODOC/CAPES',
  [TipoMembroExterno.PESQUISADOR_VISITANTE_COM_BOLSA_CNPQ]: 'Pesquisador visitante com bolsa CNPq',
  [TipoMembroExterno.DOCENTE_EXTERNO_LATO_SENSU]: 'Docente externo lato sensu',
  [TipoMembroExterno.DISCENTE_DA_INSTITUICAO]: 'Discente da instituição',
  [TipoMembroExterno.PROFESSOR_EXTERNO]: 'Professor externo',
};
