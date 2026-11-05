import { createHash, randomBytes } from 'node:crypto';

/** Token do link: 256 bits aleatórios, em base64url (43 caracteres, seguro em URL). */
export function gerarToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Só o hash é guardado; quem tem acesso ao banco não consegue montar o link. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * URL da tela de avaliação externa no front. FRONTEND_URL tem prioridade; sem ela, usa a
 * primeira origem de CORS_ORIGIN (que aponta para o front).
 */
export function urlDoLink(token: string): string {
  const base =
    process.env.FRONTEND_URL ??
    process.env.CORS_ORIGIN?.split(',')[0]?.trim() ??
    'http://localhost:3100';
  return `${base.replace(/\/+$/, '')}/avaliacao-externa/${token}`;
}
