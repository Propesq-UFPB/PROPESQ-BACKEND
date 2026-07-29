/** Funções de projeto que autorizam gestão de plano / indicação (não inclui Coorientador). */
export const FUNCOES_GESTAO_PLANO = [
  'Orientador',
  'Coordenador',
  'Coordenador Adjunto',
] as const;

export const FUNCAO_ORIENTADOR = 'Orientador' as const;

export type FuncaoGestaoPlano = (typeof FUNCOES_GESTAO_PLANO)[number];

/** @deprecated Use FUNCOES_GESTAO_PLANO */
export const FUNCOES_INDICACAO_PLANO = FUNCOES_GESTAO_PLANO;

export const SITUACOES_ELEGIVEIS_INDICACAO = [
  'APROVADO',
  'PUBLICADO',
  'EM_EXECUCAO',
  'CADASTRADO',
] as const;
