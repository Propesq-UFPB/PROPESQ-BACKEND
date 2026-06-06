-- CreateTable
CREATE TABLE "projeto_avaliacao" (
    "id" SERIAL NOT NULL,
    "avaliador_id" INTEGER NOT NULL,
    "projeto_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projeto_avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterio_avaliacao" (
    "id" SERIAL NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "nota_maxima" DOUBLE PRECISION NOT NULL,
    "ativo" BOOLEAN NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "desativado_em" TIMESTAMP(6),

    CONSTRAINT "criterio_avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacao_nota" (
    "id" SERIAL NOT NULL,
    "avaliacao_id" INTEGER,
    "criterio_avaliacao_id" INTEGER,
    "nota" DOUBLE PRECISION,

    CONSTRAINT "avaliacao_nota_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projeto_avaliacao" ADD CONSTRAINT "projeto_avaliacao_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_avaliacao" ADD CONSTRAINT "projeto_avaliacao_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao_nota" ADD CONSTRAINT "avaliacao_nota_avaliacao_id_fkey" FOREIGN KEY ("avaliacao_id") REFERENCES "projeto_avaliacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao_nota" ADD CONSTRAINT "avaliacao_nota_criterio_avaliacao_id_fkey" FOREIGN KEY ("criterio_avaliacao_id") REFERENCES "criterio_avaliacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
