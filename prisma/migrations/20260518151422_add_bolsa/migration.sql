-- CreateTable
CREATE TABLE "bolsa" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "dia_limite_indicacao" INTEGER NOT NULL,
    "dia_limite_finalizacao" INTEGER NOT NULL,
    "niveis" BIT(3) NOT NULL,
    "vinculado_cota" BOOLEAN NOT NULL,
    "necessita_relatorio" BOOLEAN NOT NULL,
    "necessidade_dados_bancarios" BOOLEAN NOT NULL,
    "possui_bancos_exclusivos" BOOLEAN NOT NULL,
    "possui_tipo_conta_excls" BOOLEAN NOT NULL,
    "envio_relatorio_inicio" DATE NOT NULL,
    "envio_relatorio_fim" DATE NOT NULL,

    CONSTRAINT "bolsa_pkey" PRIMARY KEY ("id")
);
