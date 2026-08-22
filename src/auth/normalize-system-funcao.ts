export function normalizeSystemFuncao(role?: string): string | undefined {
  if (role == null || role === '') {
    return role;
  }
  const upper = role.toUpperCase();
  return upper === 'ADMIN' ? 'GESTOR' : upper;
}
