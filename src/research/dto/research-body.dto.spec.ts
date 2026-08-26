import { validate } from 'class-validator';
import { CreateResearchProjectBodyDto } from './research-body.dto';

describe('CreateResearchProjectBodyDto', () => {
  const createDto = (resultadosEsperados: string) =>
    Object.assign(new CreateResearchProjectBodyDto(), {
      resumo: 'Resumo',
      abstract: 'Abstract',
      introducao: 'Introdução',
      objetivos: 'Objetivos',
      metodologia: 'Metodologia',
      resultados_esperados: resultadosEsperados,
      referencias: 'Referências',
    });

  it('aceita resultados esperados preenchidos', async () => {
    await expect(
      validate(createDto('Publicação de artigos e formação de pesquisadores')),
    ).resolves.toEqual([]);
  });

  it('rejeita resultados esperados vazios em novos cadastros', async () => {
    const errors = await validate(createDto(''));

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'resultados_esperados',
        }),
      ]),
    );
  });
});
