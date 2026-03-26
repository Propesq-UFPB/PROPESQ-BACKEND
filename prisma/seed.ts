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
      nome: 'TEACHER',
      descricao: 'Acesso às funcionalidades de professor',
    },
    {
      nome: 'STUDENT',
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
        categoria: CategoriaProjeto.CATEGORIA_PADRAO,
        situacao: SituacaoProjeto.SUBMETIDO,
        email: 'dev@example.com',
        unidade_id: unidadeAcademica.id,
        vigencia: new Date(),
        data_cadastro: new Date(),
      },
      include: { corpo_projeto: true },
    });
  }

  if (!projetoSeed.corpo_projeto) {
    await prisma.corpo_projeto.create({
      data: {
        resumo: 'Resumo seed',
        abstract: 'Seed abstract',
        introducao: 'Introdução seed',
        objetivos: 'Objetivos seed',
        metodologia: 'Metodologia seed',
        referencias: 'Referências seed',
        resultados_esperados: 'Resultados esperados seed',
        projeto_pesquisa_id: projetoSeed.id,
      },
    });
  }

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
