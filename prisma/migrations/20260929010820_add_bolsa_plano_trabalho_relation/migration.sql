/*
  Warnings:

  - You are about to drop the column `tipo_bolsa` on the `plano_trabalho` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "edital" DROP CONSTRAINT "edital_categoria_id_fkey";

-- DropForeignKey
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_categoria_id_fkey";

-- AlterTable
ALTER TABLE "plano_trabalho" DROP COLUMN "tipo_bolsa",
ADD COLUMN     "bolsa_id" INTEGER;

-- AddForeignKey
ALTER TABLE "edital" ADD CONSTRAINT "edital_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_edital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_bolsa_id_fkey" FOREIGN KEY ("bolsa_id") REFERENCES "bolsa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_edital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
