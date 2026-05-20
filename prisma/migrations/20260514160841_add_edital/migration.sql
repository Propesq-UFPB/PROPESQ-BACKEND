-- CreateEnum
CREATE TYPE "TitulacaoMin" AS ENUM ('SEM RESTRICOES', 'MESTRES', 'DOUTORES');

-- CreateEnum
CREATE TYPE "TipoEdital" AS ENUM ('PESQUISA', 'APOIO_GRP_PESQ', 'APOIO_NOVO_PESQ');

-- CreateEnum
CREATE TYPE "TipoIndiceMin" AS ENUM ('INDICE_EFICIENCIA_CH', 'INDICE_EFICIENCIA_PL');

-- CreateEnum
CREATE TYPE "TipoPeriodoEdital" AS ENUM ('SUBMISSAO', 'CORRECAO_PLANO_TRABALHO', 'EXECUCAO_PROJETO');

-- AlterTable
ALTER TABLE "projeto_pesquisa" ADD COLUMN     "edital_id" INTEGER;

-- CreateTable
CREATE TABLE "edital" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(255),
    "descricao" TEXT NOT NULL,
    "titulacao_min" "TitulacaoMin" NOT NULL,
    "tipo" "TipoEdital" NOT NULL,
    "validar_indice_min" "TipoIndiceMin",
    "valor_indice_min" DOUBLE PRECISION,
    "limite_solicitacoes_orientador" INTEGER NOT NULL,
    "limite_planos_orientador" INTEGER NOT NULL,
    "edital_para_voluntarios" BOOLEAN NOT NULL,
    "avaliacao_vigente" BOOLEAN NOT NULL,
    "apenas_orient_coordena_plano" BOOLEAN NOT NULL,
    "apenas_colab_vol_cadastra_plano" BOOLEAN NOT NULL,
    "prof_subst_cadastra_proj" BOOLEAN NOT NULL,
    "tec_admin_coord_proj" BOOLEAN NOT NULL,
    "periodo_submissoes_id" INTEGER NOT NULL,
    "periodo_correcao_plano_id" INTEGER,
    "periodo_execucao_id" INTEGER NOT NULL,
    "categoria" "CategoriaProjeto" NOT NULL,

    CONSTRAINT "edital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edital_cota_distribuicao" (
    "id" SERIAL NOT NULL,
    "id_edital" INTEGER NOT NULL,
    "divulgar_resultado" BOOLEAN NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "fppi_min" DOUBLE PRECISION NOT NULL,
    "fppi_max" DOUBLE PRECISION,
    "media_min_proj" DOUBLE PRECISION NOT NULL,
    "exige_doutorado" BOOLEAN NOT NULL,
    "percentual_cotas_novos_doutorandos" DOUBLE PRECISION,
    "fppi_min_novos_doutorandos" DOUBLE PRECISION,
    "fppi_max_novos_doutorandos" DOUBLE PRECISION,

    CONSTRAINT "edital_cota_distribuicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodo_edital" (
    "id" SERIAL NOT NULL,
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,

    CONSTRAINT "periodo_edital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "edital_codigo_key" ON "edital"("codigo");

-- AddForeignKey
ALTER TABLE "edital" ADD CONSTRAINT "edital_periodo_submissoes_id_fkey" FOREIGN KEY ("periodo_submissoes_id") REFERENCES "periodo_edital"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edital" ADD CONSTRAINT "edital_periodo_correcao_plano_id_fkey" FOREIGN KEY ("periodo_correcao_plano_id") REFERENCES "periodo_edital"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edital" ADD CONSTRAINT "edital_periodo_execucao_id_fkey" FOREIGN KEY ("periodo_execucao_id") REFERENCES "periodo_edital"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edital_cota_distribuicao" ADD CONSTRAINT "edital_cota_distribuicao_id_edital_fkey" FOREIGN KEY ("id_edital") REFERENCES "edital"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_edital_id_fkey" FOREIGN KEY ("edital_id") REFERENCES "edital"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
