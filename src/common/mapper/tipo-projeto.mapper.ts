import { TipoProjeto } from '@prisma/client';

export const TipoProjetoMapper: Record<TipoProjeto, string> = {
  INTERNO: 'Interno',
  EXTERNO: 'Externo',
};
