-- CreateEnum
CREATE TYPE "StatusEdital" AS ENUM (
    'RASCUNHO',
    'PUBLICADO',
    'ENCERRADO',
    'ARQUIVADO'
);

-- AlterTable
-- Editais anteriores ao novo fluxo já estavam disponíveis no sistema e,
-- portanto, são considerados publicados. Novos registros usam RASCUNHO
-- como padrão de segurança quando criados diretamente no banco.
ALTER TABLE "edital"
ADD COLUMN "status" "StatusEdital" NOT NULL DEFAULT 'PUBLICADO';

ALTER TABLE "edital"
ALTER COLUMN "status" SET DEFAULT 'RASCUNHO';
