import {
  MembroExternoFormacao,
  TipoMembroExterno,
  TipoMembroProjeto,
  TipoSexo,
} from '@prisma/client';
import { validate } from 'class-validator';
import { CreateResearchProjectExternalMemberDto } from './research-member.dto';

describe('CreateResearchProjectExternalMemberDto', () => {
  const createDto = (email: string) =>
    Object.assign(new CreateResearchProjectExternalMemberDto(), {
      funcao: TipoMembroProjeto.COLABORADOR,
      ch_dedicada: 10,
      nome: 'Pesquisadora Externa',
      email,
      sexo: TipoSexo.FEMININO,
      formacao: MembroExternoFormacao.DOUTORADO,
      tipo: TipoMembroExterno.PROFESSOR_VISITANTE,
    });

  it('aceita um e-mail válido', async () => {
    await expect(validate(createDto('externa@example.com'))).resolves.toEqual([]);
  });

  it('rejeita um e-mail inválido', async () => {
    const errors = await validate(createDto('email-invalido'));

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'email',
        }),
      ]),
    );
  });
});
