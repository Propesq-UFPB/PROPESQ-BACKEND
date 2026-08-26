import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type AreaConhecimentoCnpq = {
  codigo: string;
  grande_area: string;
  area: string;
  sub_area: string;
  especialidade: string;
};

type TabelaAreasConhecimentoCnpq = {
  fonte: string;
  relatorio_gerado_em: string;
  quantidade: number;
  areas: AreaConhecimentoCnpq[];
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não definida');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const tabelaAreasConhecimento = JSON.parse(
  readFileSync(resolve(__dirname, 'data/areas-conhecimento-cnpq.json'), 'utf8'),
) as TabelaAreasConhecimentoCnpq;

function areaConhecimentoKey(
  area: Pick<AreaConhecimentoCnpq, 'grande_area' | 'area' | 'sub_area' | 'especialidade'>,
) {
  return JSON.stringify([area.grande_area, area.area, area.sub_area, area.especialidade]);
}

async function main() {
  console.log('Iniciando cadastro de áreas de conhecimento do CNPq...');

  if (tabelaAreasConhecimento.quantidade !== tabelaAreasConhecimento.areas.length) {
    throw new Error('A quantidade declarada de áreas do CNPq não corresponde ao JSON.');
  }

  const areasExistentes = await prisma.area_conhecimento.findMany({
    select: {
      grande_area: true,
      area: true,
      sub_area: true,
      especialidade: true,
    },
  });
  const chavesExistentes = new Set(areasExistentes.map(areaConhecimentoKey));
  const novasAreas = tabelaAreasConhecimento.areas.filter(
    area => !chavesExistentes.has(areaConhecimentoKey(area)),
  );

  if (novasAreas.length > 0) {
    await prisma.area_conhecimento.createMany({
      data: novasAreas.map(area => ({
        grande_area: area.grande_area,
        area: area.area,
        sub_area: area.sub_area,
        especialidade: area.especialidade,
      })),
    });
  }

  console.log(
    `Cadastro finalizado: ${novasAreas.length} inserida(s), ${tabelaAreasConhecimento.areas.length - novasAreas.length} já existente(s).`,
  );
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
