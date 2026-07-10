import 'dotenv/config';
import {
  CategoriaProjeto,
  Idioma,
  PrismaClient,
  SituacaoProjeto,
  TipoProjeto,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const funcoes = [
    {
      nome: 'ADMIN',
      descricao: 'Acesso total ao sistema',
    },
    {
      nome: 'GESTOR',
      descricao: 'Acesso às funcionalidades de gestor',
    },
    {
      nome: 'COORDENADOR',
      descricao: 'Acesso às funcionalidades de coordenador',
    },
    {
      nome: 'ALUNO',
      descricao: 'Acesso às funcionalidades de aluno',
    },
  ];

  const objetivos_sustentavel = [
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

  const categoriasEdital = Object.values(CategoriaProjeto).map((denominacao, index) => ({
    denominacao,
    ordem: index + 1,
    ativo: true,
  }));

  console.log('Iniciando seed de funções...');

  for (const f of funcoes) {
    await prisma.funcao.upsert({
      where: { nome: f.nome },
      update: {}, // Se já existir, não altera nada
      create: {
        nome: f.nome,
        descricao: f.descricao,
      },
    });
  }

  for (const obj of objetivos_sustentavel) {
    await prisma.objetivo_desenvolvimento_sustentavel.upsert({
      where: { tipo: obj.tipo },
      update: {},
      create: {
        tipo: obj.tipo,
      },
    });
  }

  for (const categoria of categoriasEdital) {
    await prisma.categoria_edital.upsert({
      where: { denominacao: categoria.denominacao },
      update: {
        ordem: categoria.ordem,
        ativo: categoria.ativo,
      },
      create: categoria,
    });
  }

  console.log('Seed de funções finalizado com sucesso!');

  console.log('Iniciando seed do usuario admin...');

  const adminRole = await prisma.funcao.findUnique({
    where: { nome: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error('Função ADMIN não encontrada; execute o seed de funções primeiro.');
  }

  const existingAdmin = await prisma.usuario.findFirst({
    where: { email: 'dev@example.com' },
  });

  if (!existingAdmin) {
    await prisma.usuario.create({
      data: {
        nome: 'Dev Admin',
        email: 'dev@example.com',
        senha: 'changeme',
        funcao_id: adminRole.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario admin criado com sucesso!');
  } else {
    await prisma.usuario.update({
      where: { id: existingAdmin.id },
      data: {
        nome: 'Dev Admin',
        email: 'dev@example.com',
        senha: 'changeme',
        funcao_id: adminRole.id,
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario admin existente atualizado com sucesso!');
  }

  console.log('Iniciando seed do usuario coordenador...');

  const coordinatorRole = await prisma.funcao.findUnique({
    where: { nome: 'COORDENADOR' },
  });

  if (!coordinatorRole) {
    throw new Error('Função COORDENADOR não encontrada; execute o seed de funções primeiro.');
  }

  const existingCoordinator = await prisma.usuario.findFirst({
    where: { email: 'coordenador@exemplo.com' },
  });

  if (!existingCoordinator) {
    await prisma.usuario.create({
      data: {
        nome: 'Usuario Coordenador',
        email: 'coordenador@exemplo.com',
        senha: 'senha123',
        funcao_id: coordinatorRole.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario coordenador criado com sucesso!');
  } else {
    await prisma.usuario.update({
      where: { id: existingCoordinator.id },
      data: {
        nome: 'Usuario Coordenador',
        email: 'coordenador@exemplo.com',
        senha: 'senha123',
        funcao_id: coordinatorRole.id,
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario coordenador existente atualizado com sucesso!');
  }

  console.log('Iniciando seed do usuario gestor...');

  const managerRole = await prisma.funcao.findUnique({
    where: { nome: 'GESTOR' },
  });

  if (!managerRole) {
    throw new Error('Função GESTOR não encontrada; execute o seed de funções primeiro.');
  }

  const existingManager = await prisma.usuario.findFirst({
    where: { email: 'gestor@exemplo.com' },
  });

  if (!existingManager) {
    await prisma.usuario.create({
      data: {
        nome: 'Usuario Gestor',
        email: 'gestor@exemplo.com',
        senha: 'senha123',
        funcao_id: managerRole.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario gestor criado com sucesso!');
  } else {
    await prisma.usuario.update({
      where: { id: existingManager.id },
      data: {
        nome: 'Usuario Gestor',
        email: 'gestor@exemplo.com',
        senha: 'senha123',
        funcao_id: managerRole.id,
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario gestor existente atualizado com sucesso!');
  }

  console.log('Iniciando seed do usuario aluno...');

  const studentRole = await prisma.funcao.findUnique({
    where: { nome: 'ALUNO' },
  });

  if (!studentRole) {
    throw new Error('Função ALUNO não encontrada; execute o seed de funções primeiro.');
  }

  const existingStudent = await prisma.usuario.findFirst({
    where: { email: 'aluno@exemplo.com' },
  });

  if (!existingStudent) {
    await prisma.usuario.create({
      data: {
        nome: 'Usuario Aluno',
        email: 'aluno@exemplo.com',
        senha: 'senha123',
        funcao_id: studentRole.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario aluno criado com sucesso!');
  } else {
    await prisma.usuario.update({
      where: { id: existingStudent.id },
      data: {
        nome: 'Usuario Aluno',
        email: 'aluno@exemplo.com',
        senha: 'senha123',
        funcao_id: studentRole.id,
        atualizado_em: new Date(),
      },
    });

    console.log('Usuario aluno existente atualizado com sucesso!');
  }

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

  const palavraChavePt = await prisma.palavra_chave.findFirst({
    where: {
      palavra_chave: 'pesquisa',
      lingua: Idioma.PT,
      projeto_pesquisaId: null,
    },
  });

  if (!palavraChavePt) {
    await prisma.palavra_chave.create({
      data: {
        palavra_chave: 'pesquisa',
        lingua: Idioma.PT,
      },
    });
  }

  const palavraChaveEn = await prisma.palavra_chave.findFirst({
    where: {
      palavra_chave: 'research',
      lingua: Idioma.EN,
      projeto_pesquisaId: null,
    },
  });

  if (!palavraChaveEn) {
    await prisma.palavra_chave.create({
      data: {
        palavra_chave: 'research',
        lingua: Idioma.EN,
      },
    });
  }

  const atividadeSeed = await prisma.atividade_projeto_pesquisa.findFirst({
    where: {
      descricao: 'Atividade seed de projeto de pesquisa',
      projeto_pesquisa_id: null,
    },
  });

  if (!atividadeSeed) {
    await prisma.atividade_projeto_pesquisa.create({
      data: {
        descricao: 'Atividade seed de projeto de pesquisa',
      },
    });
  }

  const categoriaPadrao = await prisma.categoria_edital.findUnique({
    where: { denominacao: CategoriaProjeto.CATEGORIA_PADRAO },
  });

  if (!categoriaPadrao) {
    throw new Error(
      'Categoria padrão não encontrada; execute o seed de categoria_edital primeiro.',
    );
  }

  try {
    let projetoSeed = await prisma.projeto_pesquisa.findFirst({
      where: { codigo: 'SEED-PROJ-001' },
      include: { corpo_projeto: true },
    });

    if (!projetoSeed) {
      projetoSeed = await prisma.projeto_pesquisa.create({
        data: {
          codigo: 'SEED-PROJ-001',
          tipo: TipoProjeto.INTERNO,
          titulo: 'Projeto Seed',
          title: 'Seed Project',
          categoria_id: categoriaPadrao.id,
          situacao: SituacaoProjeto.SUBMETIDO,
          email: 'dev@example.com',
          unidade_id: unidadeAcademica.id,
          vigencia: new Date(),
          data_cadastro: new Date(),
        },
        include: { corpo_projeto: true },
      });
    } else if (projetoSeed.categoria_id !== categoriaPadrao.id) {
      projetoSeed = await prisma.projeto_pesquisa.update({
        where: { id: projetoSeed.id },
        data: { categoria_id: categoriaPadrao.id },
        include: { corpo_projeto: true },
      });
    }
  } catch (error: any) {
    if (error?.code === 'P2022') {
      console.warn(
        'Seed de projeto de pesquisa ignorado: estrutura de projeto_pesquisa no banco está desatualizada em relação ao schema Prisma.',
      );
    } else {
      throw error;
    }
  }

  // if (!projetoSeed.corpo_projeto) {
  //   await prisma.corpo_projeto.create({
  //     data: {
  //       resumo: 'Resumo seed',
  //       abstract: 'Seed abstract',
  //       introducao: 'Introdução seed',
  //       objetivos: 'Objetivos seed',
  //       metodologia: 'Metodologia seed',
  //       referencias: 'Referências seed',
  //       resultados_esperados: 'Resultados esperados seed',
  //       projeto_pesquisa_id: projetoSeed.id,
  //     },
  //   });
  // }

  console.log('Seed de entidades relacionadas a pesquisa finalizado com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
