/*
  Warnings:

  - You are about to drop the column `edital` on the `projeto_pesquisa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projeto_pesquisa" DROP COLUMN "edital",
ADD COLUMN     "grupo_pesquisa_id" INTEGER,
ADD COLUMN     "linha_pesquisa" VARCHAR(512),
ADD COLUMN     "numero_protocolo" VARCHAR(255);

-- CreateTable
CREATE TABLE "grupo_pesquisa" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "lider" VARCHAR(255) NOT NULL,
    "vice_lider" VARCHAR(255),
    "area_conhecimento_id" INTEGER NOT NULL,

    CONSTRAINT "grupo_pesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_pesquisa_linha" (
    "id" SERIAL NOT NULL,
    "linha" VARCHAR(512) NOT NULL,
    "grupo_pesquisa_id" INTEGER NOT NULL,

    CONSTRAINT "grupo_pesquisa_linha_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_grupo_pesquisa_id_fkey" FOREIGN KEY ("grupo_pesquisa_id") REFERENCES "grupo_pesquisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_pesquisa" ADD CONSTRAINT "grupo_pesquisa_area_conhecimento_id_fkey" FOREIGN KEY ("area_conhecimento_id") REFERENCES "area_conhecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupo_pesquisa_linha" ADD CONSTRAINT "grupo_pesquisa_linha_grupo_pesquisa_id_fkey" FOREIGN KEY ("grupo_pesquisa_id") REFERENCES "grupo_pesquisa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_membro" ADD CONSTRAINT "projeto_membro_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
