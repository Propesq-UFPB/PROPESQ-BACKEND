import { TipoEdital } from '@prisma/client';

export const TipoEditalMapper: Record<TipoEdital, string> = {
  PESQUISA: 'Pesquisa',
  EXTENSAO: 'Extensão',
  ENSINO_POS_GRADUACAO: 'Ensino e pós-graduação',
  OUTRO: 'Outro',
};
