-- DropForeignKey
ALTER TABLE "atividade_plano_trabalho" DROP CONSTRAINT "atividade_plano_trabalho_plano_trabalho_id_fkey";

-- DropForeignKey
ALTER TABLE "atividade_projeto_pesquisa" DROP CONSTRAINT "atividade_projeto_pesquisa_projeto_pesquisa_id_fkey";

-- DropForeignKey
ALTER TABLE "mes_plano_trabalho" DROP CONSTRAINT "mes_plano_trabalho_atividade_plano_trabalhoId_fkey";

-- DropForeignKey
ALTER TABLE "mes_projeto_pesquisa" DROP CONSTRAINT "mes_projeto_pesquisa_atividade_id_fkey";

-- DropForeignKey
ALTER TABLE "pesquisa_objetivo" DROP CONSTRAINT "pesquisa_objetivo_objetivo_id_fkey";

-- DropForeignKey
ALTER TABLE "pesquisa_objetivo" DROP CONSTRAINT "pesquisa_objetivo_pesquisa_id_fkey";

-- AddForeignKey
ALTER TABLE "atividade_projeto_pesquisa" ADD CONSTRAINT "atividade_projeto_pesquisa_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mes_projeto_pesquisa" ADD CONSTRAINT "mes_projeto_pesquisa_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade_projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "atividade_plano_trabalho" ADD CONSTRAINT "atividade_plano_trabalho_plano_trabalho_id_fkey" FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mes_plano_trabalho" ADD CONSTRAINT "mes_plano_trabalho_atividade_plano_trabalhoId_fkey" FOREIGN KEY ("atividade_plano_trabalhoId") REFERENCES "atividade_plano_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisa_objetivo" ADD CONSTRAINT "pesquisa_objetivo_pesquisa_id_fkey" FOREIGN KEY ("pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pesquisa_objetivo" ADD CONSTRAINT "pesquisa_objetivo_objetivo_id_fkey" FOREIGN KEY ("objetivo_id") REFERENCES "objetivo_desenvolvimento_sustentavel"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
