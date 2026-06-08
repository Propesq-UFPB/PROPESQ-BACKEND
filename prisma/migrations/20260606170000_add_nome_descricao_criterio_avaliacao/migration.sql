-- AlterTable
ALTER TABLE "criterio_avaliacao" ADD COLUMN     "nome" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "descricao" TEXT,
ALTER COLUMN "ativo" SET DEFAULT true;

-- Remove default after backfill (empty nome rows need a placeholder before unique constraint)
UPDATE "criterio_avaliacao" SET "nome" = 'Critério ' || "id"::text WHERE "nome" = '';

-- AlterColumn: remove temporary default on nome
ALTER TABLE "criterio_avaliacao" ALTER COLUMN "nome" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "criterio_avaliacao_nome_key" ON "criterio_avaliacao"("nome");
