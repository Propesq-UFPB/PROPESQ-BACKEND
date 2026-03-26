import { SituacaoProjeto } from '@prisma/client';

export const SituacaoProjetoMapper: Record<SituacaoProjeto, string> = {
  CADASTRO_EM_ANDAMENTO: 'Cadastro em andamento',
  SUBMETIDO: 'Submetido',
  AGUARDANDO_VALIDACAO: 'Aguardando validação',
  NECESSITA_CORRECAO: 'Necessita correção',
  VALIDADO: 'Validado',
  NAO_VALIDADO: 'Não validado',
  CADASTRADO: 'Cadastrado',
  DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE: 'Distribuído para avaliação automaticamente',
  AVALIACAO_INSUFICIENTE: 'Avaliação insuficiente',
  DISTRIBUICAO_PARA_AVALIACAO_MANUALMENTE: 'Distribuição para avaliação manual',
  APROVADO: 'Aprovado',
  EM_EXECUCAO: 'Em execução',
  CADASTRADO_SEM_PLANO: 'Cadastrado sem plano',
  FINALIZADO_RENOVADO: 'Finalizado (renovado)',
  FINALIZADO: 'Finalizado',
  REPROVADO: 'Reprovado',
  DESATIVADO: 'Desativado',
  EXCLUIDO: 'Excluído',
  AGUARDANDO_AVALIACAO: 'Aguardando avaliação',
};
