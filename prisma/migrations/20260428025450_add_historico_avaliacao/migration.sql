-- CreateTable
CREATE TABLE "historico_avaliacao" (
    "id" SERIAL NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "avaliador_id" INTEGER NOT NULL,
    "status" "SituacaoProjeto" NOT NULL,
    "observacao" TEXT,
    "data_avaliacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_avaliacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historico_avaliacao" ADD CONSTRAINT "historico_avaliacao_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_avaliacao" ADD CONSTRAINT "historico_avaliacao_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
