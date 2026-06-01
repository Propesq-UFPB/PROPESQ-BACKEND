/*
  Warnings:

  - You are about to drop the column `categoria` on the `edital` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `edital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria_id` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edital" DROP COLUMN "categoria",
ADD COLUMN     "categoria_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "projeto_pesquisa" DROP COLUMN "categoria",
ADD COLUMN     "categoria_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "edital" ADD CONSTRAINT "edital_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_edital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria_edital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
