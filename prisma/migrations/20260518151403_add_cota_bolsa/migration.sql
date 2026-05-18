/*
  Warnings:

  - Added the required column `data_cadastro` to the `edital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edital" ADD COLUMN     "data_cadastro" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "cota_bolsa" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(255),
    "relatorio_anual" BOOLEAN NOT NULL,
    "descricao" TEXT NOT NULL,
    "envio_relatorios_parciais_id" INTEGER NOT NULL,
    "envio_relatorios_finais_id" INTEGER NOT NULL,
    "cadastro_plano_voluntario_id" INTEGER NOT NULL,

    CONSTRAINT "cota_bolsa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodo_cota_bolsa" (
    "id" SERIAL NOT NULL,
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,

    CONSTRAINT "periodo_cota_bolsa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cota_bolsa_codigo_key" ON "cota_bolsa"("codigo");

-- AddForeignKey
ALTER TABLE "cota_bolsa" ADD CONSTRAINT "cota_bolsa_envio_relatorios_parciais_id_fkey" FOREIGN KEY ("envio_relatorios_parciais_id") REFERENCES "periodo_cota_bolsa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cota_bolsa" ADD CONSTRAINT "cota_bolsa_envio_relatorios_finais_id_fkey" FOREIGN KEY ("envio_relatorios_finais_id") REFERENCES "periodo_cota_bolsa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cota_bolsa" ADD CONSTRAINT "cota_bolsa_cadastro_plano_voluntario_id_fkey" FOREIGN KEY ("cadastro_plano_voluntario_id") REFERENCES "periodo_cota_bolsa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
