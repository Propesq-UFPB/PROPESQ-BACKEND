import { SetMetadata } from '@nestjs/common';

export const PERMITIR_AVALIADOR_EXTERNO_KEY = 'permitirAvaliadorExterno';

/**
 * Libera a rota para sessões de avaliador externo (acesso por link). Sem este decorator,
 * o AvaliadorExternoGuard recusa essas sessões em qualquer rota autenticada.
 */
export const PermitirAvaliadorExterno = () => SetMetadata(PERMITIR_AVALIADOR_EXTERNO_KEY, true);
