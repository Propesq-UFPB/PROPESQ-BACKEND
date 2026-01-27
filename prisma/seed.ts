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

  console.log('Iniciando seed do usuario admin...');

  const adminRole = await prisma.funcao.findUnique({
    where: { nome: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error(
      'Função ADMIN não encontrada; execute o seed de funções primeiro.',
    );
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
    console.log('Usuario admin ja existe, nada a fazer.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
