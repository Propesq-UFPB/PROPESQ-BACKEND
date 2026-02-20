import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
