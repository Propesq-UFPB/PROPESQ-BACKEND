import 'dotenv/config';
import { PrismaClient } from "generated/prisma/client";
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