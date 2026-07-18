/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `anexo_edital` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nome` to the `anexo_edital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "anexo_edital" ADD COLUMN     "nome" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "anexo_edital_nome_key" ON "anexo_edital"("nome");
