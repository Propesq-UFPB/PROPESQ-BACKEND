import { areasAtualizadasNoAno } from './areas-atualizacao';

describe('areasAtualizadasNoAno', () => {
  const agora = new Date(2027, 2, 10);

  it('accepts updates made in the current year', () => {
    expect(areasAtualizadasNoAno(new Date(2027, 0, 1), agora)).toBe(true);
  });

  it('rejects updates from previous years or missing dates', () => {
    expect(areasAtualizadasNoAno(new Date(2026, 11, 31), agora)).toBe(false);
    expect(areasAtualizadasNoAno(null, agora)).toBe(false);
  });
});
