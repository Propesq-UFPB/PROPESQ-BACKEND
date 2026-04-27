/*
  Warnings:

  - You are about to drop the column `reset_token` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token_expires` on the `usuario` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "usuario_reset_token_key";

-- AlterTable
ALTER TABLE "projeto_pesquisa" ADD COLUMN     "data_fim" TIMESTAMP(6),
ADD COLUMN     "data_inicio" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "reset_token",
DROP COLUMN "reset_token_expires";
