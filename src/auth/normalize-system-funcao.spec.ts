import { normalizeSystemFuncao } from './normalize-system-funcao';

describe('normalizeSystemFuncao', () => {
  it('mapeia ADMIN para GESTOR', () => {
    expect(normalizeSystemFuncao('ADMIN')).toBe('GESTOR');
    expect(normalizeSystemFuncao('admin')).toBe('GESTOR');
  });

  it('mantém GESTOR e COORDENADOR', () => {
    expect(normalizeSystemFuncao('GESTOR')).toBe('GESTOR');
    expect(normalizeSystemFuncao('COORDENADOR')).toBe('COORDENADOR');
  });

  it('preserva vazio e undefined', () => {
    expect(normalizeSystemFuncao(undefined)).toBeUndefined();
    expect(normalizeSystemFuncao('')).toBe('');
  });
});
