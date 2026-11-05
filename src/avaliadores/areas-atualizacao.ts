/** As áreas de avaliação precisam ser revisadas uma vez a cada ano civil. */
export function areasAtualizadasNoAno(data: Date | null | undefined, agora = new Date()): boolean {
  return !!data && data.getFullYear() === agora.getFullYear();
}
