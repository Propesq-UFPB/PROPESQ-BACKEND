-- AlterTable
ALTER TABLE "projeto_pesquisa" ADD COLUMN     "avaliador_id" INTEGER;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
