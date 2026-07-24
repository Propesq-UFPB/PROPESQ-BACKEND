import { StatusEdital } from '@prisma/client';

export const StatusEditalMapper: Record<StatusEdital, string> = {
  [StatusEdital.RASCUNHO]: 'Rascunho',
  [StatusEdital.PUBLICADO]: 'Publicado',
  [StatusEdital.ENCERRADO]: 'Encerrado',
  [StatusEdital.ARQUIVADO]: 'Arquivado',
};
