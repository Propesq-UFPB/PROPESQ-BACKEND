/*
  Warnings:

  - You are about to drop the column `resultados_esperados` on the `corpo_projeto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "corpo_projeto" DROP COLUMN "resultados_esperados";

-- DropEnum
DROP TYPE "CategoriaProjeto";

-- RenameIndex
ALTER INDEX "membro_projeto_projeto_pesquisa_id_usuario_id_funcao_projeto_ke" RENAME TO "membro_projeto_projeto_pesquisa_id_usuario_id_funcao_projet_key";
