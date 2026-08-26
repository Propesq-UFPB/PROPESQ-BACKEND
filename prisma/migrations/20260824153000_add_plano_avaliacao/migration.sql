-- CreateTable
CREATE TABLE "plano_avaliacao" (
    "id" SERIAL NOT NULL,
    "projeto_avaliacao_id" INTEGER NOT NULL,
    "plano_trabalho_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plano_avaliacao_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "avaliacao_nota" ADD COLUMN "plano_avaliacao_id" INTEGER,
ALTER COLUMN "criterio_avaliacao_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "plano_avaliacao_plano_trabalho_id_idx" ON "plano_avaliacao"("plano_trabalho_id");

-- CreateIndex
CREATE UNIQUE INDEX "plano_avaliacao_projeto_avaliacao_id_plano_trabalho_id_key" ON "plano_avaliacao"("projeto_avaliacao_id", "plano_trabalho_id");

-- CreateIndex
CREATE INDEX "projeto_avaliacao_avaliador_id_idx" ON "projeto_avaliacao"("avaliador_id");

-- CreateIndex
CREATE INDEX "projeto_avaliacao_projeto_id_idx" ON "projeto_avaliacao"("projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacao_nota_avaliacao_id_criterio_avaliacao_id_key" ON "avaliacao_nota"("avaliacao_id", "criterio_avaliacao_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacao_nota_plano_avaliacao_id_criterio_avaliacao_id_key" ON "avaliacao_nota"("plano_avaliacao_id", "criterio_avaliacao_id");

-- DropForeignKey
ALTER TABLE "avaliacao_nota" DROP CONSTRAINT IF EXISTS "avaliacao_nota_avaliacao_id_fkey";

-- DropForeignKey
ALTER TABLE "avaliacao_nota" DROP CONSTRAINT IF EXISTS "avaliacao_nota_criterio_avaliacao_id_fkey";

-- AddForeignKey
ALTER TABLE "plano_avaliacao" ADD CONSTRAINT "plano_avaliacao_projeto_avaliacao_id_fkey" FOREIGN KEY ("projeto_avaliacao_id") REFERENCES "projeto_avaliacao"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_avaliacao" ADD CONSTRAINT "plano_avaliacao_plano_trabalho_id_fkey" FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao_nota" ADD CONSTRAINT "avaliacao_nota_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "projeto_avaliacao"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao_nota" ADD CONSTRAINT "avaliacao_nota_plano_avaliacao_id_fkey" FOREIGN KEY ("plano_avaliacao_id") REFERENCES "plano_avaliacao"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao_nota" ADD CONSTRAINT "avaliacao_nota_criterio_avaliacao_id_fkey" FOREIGN KEY ("criterio_avaliacao_id") REFERENCES "criterio_avaliacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
