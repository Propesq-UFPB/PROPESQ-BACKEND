import 'dotenv/config';
import {
  CategoriaFuncaoProjeto,
  CategoriaProjeto,
  Idioma,
  Prisma,
  PrismaClient,
  PublicoAlvo,
  SituacaoProjeto,
  StatusRelatorio,
  TipoEdital,
  TipoProjeto,
  TipoRelatorio,
  TitulacaoMin,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const FUNCOES = [
  { nome: 'ADMIN', descricao: 'Acesso total ao sistema' },
  { nome: 'GESTOR', descricao: 'Acesso às funcionalidades de gestor' },
  { nome: 'COORDENADOR', descricao: 'Acesso às funcionalidades de coordenador' },
  { nome: 'ALUNO', descricao: 'Acesso às funcionalidades de aluno' },
];

const OBJETIVOS_SUSTENTAVEL = [
  { tipo: 'Erradicação da Pobreza' },
  { tipo: 'Fome Zero e Agricultura Sustentável' },
  { tipo: 'Saúde e Bem-Estar' },
  { tipo: 'Educação de Qualidade' },
  { tipo: 'Igualdade de Gênero' },
  { tipo: 'Água Potável e Saneamento' },
  { tipo: 'Energia Limpa e Acessível' },
  { tipo: 'Trabalho Decente e Crescimento Econômico' },
  { tipo: 'Indústria, Inovação e Infraestrutura' },
  { tipo: 'Redução das Desigualdades' },
  { tipo: 'Cidades e Comunidades Sustentáveis' },
  { tipo: 'Consumo e Produção Responsáveis' },
  { tipo: 'Ação Contra a Mudança Global do Clima' },
  { tipo: 'Vida na Água' },
  { tipo: 'Vida Terrestre' },
  { tipo: 'Paz, Justiça e Instituições Eficazes' },
  { tipo: 'Parcerias e Meios de Implementação' },
];

const CATEGORIAS_EDITAL = Object.values(CategoriaProjeto).map((denominacao, index) => ({
  denominacao,
  ordem: index + 1,
  ativo: true,
}));

const ORGAOS_FINANCIADORES = [
  { nome: 'CNPq' },
  { nome: 'CAPES' },
  { nome: 'FINEP' },
  { nome: 'FUNCAP' },
  { nome: 'FAPESP' },
  { nome: 'FAPERJ' },
];

const FUNCOES_PROJETO = [
  {
    nome: 'Orientador',
    categoria: CategoriaFuncaoProjeto.ACADEMICO,
    descricao: 'Docente responsável pela orientação do projeto.',
  },
  {
    nome: 'Coorientador',
    categoria: CategoriaFuncaoProjeto.ACADEMICO,
    descricao: 'Apoia a orientação do projeto.',
  },
  {
    nome: 'Bolsista',
    categoria: CategoriaFuncaoProjeto.BOLSA,
    descricao: 'Discente com bolsa vinculada ao projeto.',
  },
  {
    nome: 'Voluntário',
    categoria: CategoriaFuncaoProjeto.BOLSA,
    descricao: 'Discente sem bolsa, com participação voluntária.',
  },
  {
    nome: 'Colaborador Externo',
    categoria: CategoriaFuncaoProjeto.EXTERNO,
    descricao: 'Participante sem vínculo institucional direto.',
  },
  {
    nome: 'Coordenador',
    categoria: CategoriaFuncaoProjeto.GESTAO,
    descricao: 'Responsável pela coordenação do projeto.',
  },
  {
    nome: 'Coordenador Adjunto',
    categoria: CategoriaFuncaoProjeto.GESTAO,
    descricao: 'Apoia a coordenação do projeto.',
  },
  {
    nome: 'Pesquisador',
    categoria: CategoriaFuncaoProjeto.ACADEMICO,
    descricao: 'Pesquisador integrante da equipe do projeto.',
  },
  {
    nome: 'Colaborador',
    categoria: CategoriaFuncaoProjeto.OUTRO,
    descricao: 'Colaborador da equipe do projeto.',
  },
];

const TIPOS_USUARIO_SEED = [
  {
    nome: 'Coordenador de Projeto',
    descricao: 'Pode criar/gerenciar projetos e submeter propostas em editais.',
    publicos: [
      PublicoAlvo.DOCENTE,
      PublicoAlvo.TECNICO_ADMINISTRATIVO,
      PublicoAlvo.POS_DOUTORANDO,
    ],
  },
  {
    nome: 'Discente',
    descricao: 'Participação em projetos como bolsista/voluntário.',
    publicos: [
      PublicoAlvo.DISCENTE_UFPB_MEDIO,
      PublicoAlvo.DISCENTE_UFPB_SUPERIOR,
      PublicoAlvo.DISCENTE_EXTERNO_SEM_SIGAA,
    ],
  },
  {
    nome: 'Gestor',
    descricao: 'Gestão de editais, relatórios e acompanhamento institucional.',
    publicos: [PublicoAlvo.TECNICO_ADMINISTRATIVO, PublicoAlvo.DOCENTE],
  },
];

const BOLSAS_SEED = [
  { descricao: 'PIBIC', orgaoNome: 'CNPq', valor: 700, permite_acumulo: false },
  { descricao: 'PIBITI', orgaoNome: 'CNPq', valor: 700, permite_acumulo: false },
  { descricao: 'PIBIC-EM', orgaoNome: 'CNPq', valor: 100, permite_acumulo: true },
  { descricao: 'PROBIC', orgaoNome: 'FUNCAP', valor: 700, permite_acumulo: false },
  { descricao: 'Mestrado', orgaoNome: 'CAPES', valor: 2100, permite_acumulo: false },
  { descricao: 'Doutorado', orgaoNome: 'CAPES', valor: 3100, permite_acumulo: false },
];

const USUARIOS_SEED = [
  {
    roleName: 'ADMIN',
    email: 'dev@example.com',
    nome: 'Dev Admin',
    senha: 'changeme',
    label: 'admin',
  },
  {
    roleName: 'COORDENADOR',
    email: 'coordenador@exemplo.com',
    nome: 'Usuario Coordenador',
    senha: 'senha123',
    label: 'coordenador',
  },
  {
    roleName: 'GESTOR',
    email: 'gestor@exemplo.com',
    nome: 'Usuario Gestor',
    senha: 'senha123',
    label: 'gestor',
  },
  {
    roleName: 'ALUNO',
    email: 'aluno@exemplo.com',
    nome: 'Usuario Aluno',
    senha: 'senha123',
    label: 'aluno',
  },
];

async function seedFuncoes() {
  console.log('Iniciando seed de funções...');
  for (const f of FUNCOES) {
    await prisma.funcao.upsert({
      where: { nome: f.nome },
      update: {},
      create: { nome: f.nome, descricao: f.descricao },
    });
  }
  console.log('Seed de funções finalizado com sucesso!');
}

async function seedObjetivosSustentavel() {
  for (const obj of OBJETIVOS_SUSTENTAVEL) {
    await prisma.objetivo_desenvolvimento_sustentavel.upsert({
      where: { tipo: obj.tipo },
      update: {},
      create: { tipo: obj.tipo },
    });
  }
}

async function seedCategoriasEdital() {
  for (const categoria of CATEGORIAS_EDITAL) {
    await prisma.categoria_edital.upsert({
      where: { denominacao: categoria.denominacao },
      update: { ordem: categoria.ordem, ativo: categoria.ativo },
      create: categoria,
    });
  }
}

async function seedOrgaosFinanciadores() {
  console.log('Iniciando seed de órgãos financiadores...');
  for (const orgao of ORGAOS_FINANCIADORES) {
    await prisma.orgao_financiador.upsert({
      where: { nome: orgao.nome },
      update: {},
      create: { nome: orgao.nome },
    });
  }
  console.log('Seed de órgãos financiadores finalizado com sucesso!');
}

async function seedFuncoesProjeto() {
  console.log('Iniciando seed de funções de projeto...');
  for (const funcao of FUNCOES_PROJETO) {
    await prisma.funcao_projeto.upsert({
      where: { nome: funcao.nome },
      update: {},
      create: {
        nome: funcao.nome,
        categoria: funcao.categoria,
        descricao: funcao.descricao,
        ativo: true,
      },
    });
  }
  console.log('Seed de funções de projeto finalizado com sucesso!');
}

async function seedTiposUsuario() {
  console.log('Iniciando seed de tipos de usuário...');
  for (const tipo of TIPOS_USUARIO_SEED) {
    await prisma.tipo_usuario.upsert({
      where: { nome: tipo.nome },
      update: {},
      create: {
        nome: tipo.nome,
        descricao: tipo.descricao,
        publicos: tipo.publicos,
        ativo: true,
      },
    });
  }
  console.log('Seed de tipos de usuário finalizado com sucesso!');
}

async function seedBolsas() {
  console.log('Iniciando seed de bolsas...');
  const year = new Date().getFullYear();

  for (const bolsaSeed of BOLSAS_SEED) {
    const orgao = await prisma.orgao_financiador.findUnique({
      where: { nome: bolsaSeed.orgaoNome },
    });

    if (!orgao) {
      throw new Error(
        `Órgão financiador "${bolsaSeed.orgaoNome}" não encontrado; execute o seed de órgãos primeiro.`,
      );
    }

    const existingBolsa = await prisma.bolsa.findFirst({
      where: { descricao: bolsaSeed.descricao },
    });

    if (existingBolsa) {
      continue;
    }

    await prisma.bolsa.create({
      data: {
        descricao: bolsaSeed.descricao,
        categoria: bolsaSeed.descricao,
        dia_limite_indicacao: 15,
        dia_limite_finalizacao: 20,
        niveis: '111',
        vinculado_cota: false,
        necessita_relatorio: false,
        necessidade_dados_bancarios: false,
        possui_bancos_exclusivos: false,
        possui_tipo_conta_excls: false,
        envio_relatorio_inicio: new Date(`${year}-01-01`),
        envio_relatorio_fim: new Date(`${year}-12-31`),
        orgao_id: orgao.id,
        valor: new Prisma.Decimal(bolsaSeed.valor),
        permite_acumulo: bolsaSeed.permite_acumulo,
      },
    });
  }

  console.log('Seed de bolsas finalizado com sucesso!');
}

async function upsertUsuarioSeed(user: (typeof USUARIOS_SEED)[number]) {
  console.log(`Iniciando seed do usuario ${user.label}...`);

  const role = await prisma.funcao.findUnique({
    where: { nome: user.roleName },
  });

  if (!role) {
    throw new Error(`Função ${user.roleName} não encontrada; execute o seed de funções primeiro.`);
  }

  const existing = await prisma.usuario.findFirst({
    where: { email: user.email },
  });

  if (!existing) {
    await prisma.usuario.create({
      data: {
        nome: user.nome,
        email: user.email,
        senha: user.senha,
        funcao_id: role.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      },
    });
    console.log(`Usuario ${user.label} criado com sucesso!`);
    return;
  }

  await prisma.usuario.update({
    where: { id: existing.id },
    data: {
      nome: user.nome,
      email: user.email,
      senha: user.senha,
      funcao_id: role.id,
      atualizado_em: new Date(),
    },
  });
  console.log(`Usuario ${user.label} existente atualizado com sucesso!`);
}

async function seedUsuarios() {
  for (const user of USUARIOS_SEED) {
    await upsertUsuarioSeed(user);
  }
}

async function ensurePalavraChave(palavra_chave: string, lingua: Idioma) {
  const existing = await prisma.palavra_chave.findFirst({
    where: {
      palavra_chave,
      lingua,
      projeto_pesquisaId: null,
    },
  });

  if (existing) {
    return;
  }

  await prisma.palavra_chave.create({
    data: { palavra_chave, lingua },
  });
}

async function ensureAtividadeSeed() {
  const existing = await prisma.atividade_projeto_pesquisa.findFirst({
    where: {
      descricao: 'Atividade seed de projeto de pesquisa',
      projeto_pesquisa_id: null,
    },
  });

  if (existing) {
    return;
  }

  await prisma.atividade_projeto_pesquisa.create({
    data: { descricao: 'Atividade seed de projeto de pesquisa' },
  });
}

async function seedProjetoPesquisa(unidadeId: number, categoriaId: number, editalId: number) {
  try {
    const projetoSeed = await prisma.projeto_pesquisa.findFirst({
      where: { codigo: 'SEED-PROJ-001' },
    });

    const dataFim = new Date('2026-08-15T00:00:00.000Z');

    if (!projetoSeed) {
      return prisma.projeto_pesquisa.create({
        data: {
          codigo: 'SEED-PROJ-001',
          tipo: TipoProjeto.INTERNO,
          titulo: 'Projeto Seed Ativo',
          title: 'Active Seed Project',
          categoria_id: categoriaId,
          situacao: SituacaoProjeto.EM_EXECUCAO,
          email: 'dev@example.com',
          unidade_id: unidadeId,
          edital_id: editalId,
          data_inicio: new Date('2026-04-01T00:00:00.000Z'),
          data_fim: dataFim,
          vigencia: dataFim,
          data_cadastro: new Date(),
        },
      });
    }

    return prisma.projeto_pesquisa.update({
      where: { id: projetoSeed.id },
      data: {
        categoria_id: categoriaId,
        situacao: SituacaoProjeto.EM_EXECUCAO,
        edital_id: editalId,
        titulo: 'Projeto Seed Ativo',
        title: 'Active Seed Project',
        data_inicio: new Date('2026-04-01T00:00:00.000Z'),
        data_fim: dataFim,
        vigencia: dataFim,
      },
    });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError?.code === 'P2022') {
      console.warn(
        'Seed de projeto de pesquisa ignorado: estrutura de projeto_pesquisa no banco está desatualizada em relação ao schema Prisma.',
      );
      return null;
    }
    throw error;
  }
}

async function seedDashboardDados(projetoId: number) {
  console.log('Iniciando seed de dados do dashboard...');

  const aluno = await prisma.usuario.findFirst({
    where: { email: 'aluno@exemplo.com' },
  });
  const coordenador = await prisma.usuario.findFirst({
    where: { email: 'coordenador@exemplo.com' },
  });
  const funcaoBolsista = await prisma.funcao_projeto.findUnique({
    where: { nome: 'Bolsista' },
  });

  if (!aluno || !coordenador || !funcaoBolsista) {
    throw new Error(
      'Usuários ou função Bolsista não encontrados; execute o seed de usuários/funções de projeto primeiro.',
    );
  }

  await prisma.membro_projeto.upsert({
    where: {
      projeto_pesquisa_id_usuario_id_funcao_projeto_id: {
        projeto_pesquisa_id: projetoId,
        usuario_id: aluno.id,
        funcao_projeto_id: funcaoBolsista.id,
      },
    },
    update: { ativo: true },
    create: {
      projeto_pesquisa_id: projetoId,
      usuario_id: aluno.id,
      funcao_projeto_id: funcaoBolsista.id,
      ativo: true,
    },
  });

  const relatorioParcial = await prisma.relatorio.findFirst({
    where: {
      projeto_pesquisa_id: projetoId,
      tipo: TipoRelatorio.PARCIAL,
      status: StatusRelatorio.PENDENTE,
    },
  });

  if (!relatorioParcial) {
    await prisma.relatorio.create({
      data: {
        projeto_pesquisa_id: projetoId,
        tipo: TipoRelatorio.PARCIAL,
        status: StatusRelatorio.PENDENTE,
        prazo_fim: new Date('2026-08-20T00:00:00.000Z'),
      },
    });
  }

  const relatorioFinal = await prisma.relatorio.findFirst({
    where: {
      projeto_pesquisa_id: projetoId,
      tipo: TipoRelatorio.FINAL,
    },
  });

  if (!relatorioFinal) {
    await prisma.relatorio.create({
      data: {
        projeto_pesquisa_id: projetoId,
        tipo: TipoRelatorio.FINAL,
        status: StatusRelatorio.PENDENTE,
        prazo_fim: new Date('2026-09-30T00:00:00.000Z'),
      },
    });
  }

  await prisma.certificado.upsert({
    where: { codigo: 'SEED-CERT-001' },
    update: {
      usuario_id: aluno.id,
      projeto_pesquisa_id: projetoId,
      tipo: 'Participação como Bolsista',
      emitido_em: new Date('2026-06-01T00:00:00.000Z'),
    },
    create: {
      codigo: 'SEED-CERT-001',
      usuario_id: aluno.id,
      projeto_pesquisa_id: projetoId,
      tipo: 'Participação como Bolsista',
      emitido_em: new Date('2026-06-01T00:00:00.000Z'),
    },
  });

  await prisma.certificado.upsert({
    where: { codigo: 'SEED-CERT-002' },
    update: {
      usuario_id: coordenador.id,
      projeto_pesquisa_id: projetoId,
      tipo: 'Orientação de Projeto',
      emitido_em: new Date('2026-06-15T00:00:00.000Z'),
    },
    create: {
      codigo: 'SEED-CERT-002',
      usuario_id: coordenador.id,
      projeto_pesquisa_id: projetoId,
      tipo: 'Orientação de Projeto',
      emitido_em: new Date('2026-06-15T00:00:00.000Z'),
    },
  });

  console.log('Seed de dados do dashboard finalizado com sucesso!');
}

async function seedEntidadesPesquisa() {
  console.log('Iniciando seed de entidades relacionadas a pesquisa...');

  const unidadeAcademica = await prisma.unidade_academica.upsert({
    where: { sigla: 'PROP' },
    update: {
      nome: 'Unidade Acadêmica PROPESQ',
      ativo: true,
    },
    create: {
      sigla: 'PROP',
      nome: 'Unidade Acadêmica PROPESQ',
      ativo: true,
    },
  });

  await prisma.departamento.upsert({
    where: {
      unidade_id_sigla: {
        unidade_id: unidadeAcademica.id,
        sigla: 'DPROP',
      },
    },
    update: {
      nome: 'Departamento PROPESQ',
      ativo: true,
    },
    create: {
      unidade_id: unidadeAcademica.id,
      sigla: 'DPROP',
      nome: 'Departamento PROPESQ',
      ativo: true,
    },
  });

  const categoriaPadrao = await prisma.categoria_edital.findUnique({
    where: { denominacao: CategoriaProjeto.CATEGORIA_PADRAO },
  });

  if (!categoriaPadrao) {
    throw new Error(
      'Categoria padrão não encontrada; execute o seed de categoria_edital primeiro.',
    );
  }

  const cotaBolsaSeed = await prisma.cota_bolsa.upsert({
    where: { codigo: 'SEED-COTA-001' },
    update: {
      relatorio_anual: true,
      orgao_financiador: 'PROPESQ',
      descricao: 'Cota bolsa seed',
      periodo_validade: {
        update: {
          inicio: new Date('2026-04-01T00:00:00.000Z'),
          fim: new Date('2027-03-31T00:00:00.000Z'),
        },
      },
      periodo_relatorio_parcial: {
        update: {
          inicio: new Date('2026-09-01T00:00:00.000Z'),
          fim: new Date('2026-09-30T00:00:00.000Z'),
        },
      },
      periodo_relatorio_final: {
        update: {
          inicio: new Date('2027-03-01T00:00:00.000Z'),
          fim: new Date('2027-03-31T00:00:00.000Z'),
        },
      },
      periodo_cadastro_voluntario: {
        update: {
          inicio: new Date('2026-04-01T00:00:00.000Z'),
          fim: new Date('2026-04-30T00:00:00.000Z'),
        },
      },
    },
    create: {
      codigo: 'SEED-COTA-001',
      relatorio_anual: true,
      orgao_financiador: 'PROPESQ',
      descricao: 'Cota bolsa seed',
      periodo_validade: {
        create: {
          inicio: new Date('2026-04-01T00:00:00.000Z'),
          fim: new Date('2027-03-31T00:00:00.000Z'),
        },
      },
      periodo_relatorio_parcial: {
        create: {
          inicio: new Date('2026-09-01T00:00:00.000Z'),
          fim: new Date('2026-09-30T00:00:00.000Z'),
        },
      },
      periodo_relatorio_final: {
        create: {
          inicio: new Date('2027-03-01T00:00:00.000Z'),
          fim: new Date('2027-03-31T00:00:00.000Z'),
        },
      },
      periodo_cadastro_voluntario: {
        create: {
          inicio: new Date('2026-04-01T00:00:00.000Z'),
          fim: new Date('2026-04-30T00:00:00.000Z'),
        },
      },
    },
  });

  await prisma.edital.upsert({
    where: { codigo: 'SEED-EDITAL-001' },
    update: {
      descricao: 'Edital seed de iniciação científica',
      titulacao_min: TitulacaoMin.DOUTORADO,
      tipo: TipoEdital.PESQUISA,
      limite_solicitacoes_orientador: 2,
      limite_planos_orientador: 4,
      avaliacao_vigente: true,
      apenas_orient_coordena_plano: false,
      tec_admin_coord_proj: false,
      divulgar_resultado: false,
      categoria: {
        connect: {
          id: categoriaPadrao.id,
        },
      },
      cota_bolsa: {
        connect: {
          id: cotaBolsaSeed.id,
        },
      },
      periodo_submissoes: {
        update: {
          inicio: new Date('2026-02-01T00:00:00.000Z'),
          fim: new Date('2026-03-15T00:00:00.000Z'),
        },
      },
      periodo_execucao_rel: {
        update: {
          inicio: new Date('2026-04-01T00:00:00.000Z'),
          fim: new Date('2027-03-31T00:00:00.000Z'),
        },
      },
      edital_cota_distribuicao: {
        deleteMany: {},
        create: [
          {
            quantidade: 10,
            fppi_min: 0,
            media_min_proj: 7,
            exige_doutorado: true,
          },
        ],
      },
    },
    create: {
      codigo: 'SEED-EDITAL-001',
      descricao: 'Edital seed de iniciação científica',
      titulacao_min: TitulacaoMin.DOUTORADO,
      tipo: TipoEdital.PESQUISA,
      limite_solicitacoes_orientador: 2,
      limite_planos_orientador: 4,
      avaliacao_vigente: true,
      apenas_orient_coordena_plano: false,
      tec_admin_coord_proj: false,
      divulgar_resultado: false,
      data_cadastro: new Date(),
      categoria: {
        connect: {
          id: categoriaPadrao.id,
        },
      },
      cota_bolsa: {
        connect: {
          id: cotaBolsaSeed.id,
        },
      },
      periodo_submissoes: {
        create: {
          inicio: new Date('2026-02-01T00:00:00.000Z'),
          fim: new Date('2026-03-15T00:00:00.000Z'),
        },
      },
      periodo_execucao_rel: {
        create: {
          inicio: new Date('2026-04-01T00:00:00.000Z'),
          fim: new Date('2027-03-31T00:00:00.000Z'),
        },
      },
      edital_cota_distribuicao: {
        create: [
          {
            quantidade: 10,
            fppi_min: 0,
            media_min_proj: 7,
            exige_doutorado: true,
          },
        ],
      },
    },
  });

  const editalSeed = await prisma.edital.findUniqueOrThrow({
    where: { codigo: 'SEED-EDITAL-001' },
  });

  await prisma.edital_unidade_academica.upsert({
    where: {
      edital_id_unidade_id: {
        edital_id: editalSeed.id,
        unidade_id: unidadeAcademica.id,
      },
    },
    update: {},
    create: {
      edital_id: editalSeed.id,
      unidade_id: unidadeAcademica.id,
    },
  });
  await ensurePalavraChave('pesquisa', Idioma.PT);
  await ensurePalavraChave('research', Idioma.EN);
  await ensureAtividadeSeed();
  const projeto = await seedProjetoPesquisa(unidadeAcademica.id, categoriaPadrao.id, editalSeed.id);

  if (projeto) {
    await seedDashboardDados(projeto.id);
  }

  console.log('Seed de entidades relacionadas a pesquisa finalizado com sucesso!');
}

async function main() {
  await seedFuncoes();
  await seedObjetivosSustentavel();
  await seedCategoriasEdital();
  await seedOrgaosFinanciadores();
  await seedFuncoesProjeto();
  await seedTiposUsuario();
  await seedBolsas();
  await seedUsuarios();
  await seedEntidadesPesquisa();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
