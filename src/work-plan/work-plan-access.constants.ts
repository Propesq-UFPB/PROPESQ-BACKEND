/** Funções de projeto que autorizam indicação (não inclui Coorientador). */
export const FUNCOES_INDICACAO_PLANO = [
  'Orientador',
  'Coordenador',
  'Coordenador Adjunto',
] as const;

export const FUNCAO_ORIENTADOR = 'Orientador' as const;

export type FuncaoIndicacaoPlano = (typeof FUNCOES_INDICACAO_PLANO)[number];

export const SITUACOES_ELEGIVEIS_INDICACAO = [
  'APROVADO',
  'PUBLICADO',
  'EM_EXECUCAO',
  'CADASTRADO',
] as const;
