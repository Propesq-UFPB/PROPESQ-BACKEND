import { gerarToken, hashToken, urlDoLink } from './token';

describe('token de acesso externo', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  it('gera tokens url-safe com 256 bits e sem repetição', () => {
    const tokens = new Set(Array.from({ length: 50 }, gerarToken));
    expect(tokens.size).toBe(50);
    for (const t of tokens) expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('guarda o hash SHA-256 em hexadecimal, determinístico', () => {
    expect(hashToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('monta a URL a partir de FRONTEND_URL ou da primeira origem do CORS', () => {
    process.env.FRONTEND_URL = 'https://portal.propesq.ufpb.br/';
    expect(urlDoLink('t0k')).toBe('https://portal.propesq.ufpb.br/avaliacao-externa/t0k');

    delete process.env.FRONTEND_URL;
    process.env.CORS_ORIGIN = 'https://a.exemplo, https://b.exemplo';
    expect(urlDoLink('t0k')).toBe('https://a.exemplo/avaliacao-externa/t0k');
  });
});
