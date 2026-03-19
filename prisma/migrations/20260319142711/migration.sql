/*
  Warnings:

  - You are about to drop the column `corpo_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `cronograma_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `localidade_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `palavra_chave_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `plano_trabalho_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the `atividade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cronograma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `localidade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[plano_trabalho_id]` on the table `corpo_plano_trabalho` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projeto_pesquisa_id]` on the table `corpo_projeto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `plano_trabalho_id` to the `corpo_plano_trabalho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `abstract` to the `corpo_projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projeto_pesquisa_id` to the `corpo_projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultados_esperados` to the `corpo_projeto` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `lingua` on the `palavra_chave` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `pesquisa_id` to the `plano_trabalho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_cadastro` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidade_id` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `projeto_pesquisa` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoria` on the `projeto_pesquisa` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `situação` on the `projeto_pesquisa` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Idioma" AS ENUM ('PT', 'EN');

-- CreateEnum
CREATE TYPE "TipoProjeto" AS ENUM ('INTERNO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "SituacaoProjeto" AS ENUM ('CADASTRO_EM_ANDAMENTO', 'SUBMETIDO', 'AGUARDANDO_VALIDACAO', 'NECESSITA_CORRECAO', 'VALIDADO', 'NAO_VALIDADO', 'CADASTRADO', 'DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE', 'AVALIACAO_INSUFICIENTE', 'DISTRIBUICAO_PARA_AVALIACAO_MANUALMENTE', 'APROVADO', 'EM_EXECUCAO', 'CADASTRADO_SEM_PLANO', 'FINALIZADO_RENOVADO', 'FINALIZADO', 'REPROVADO', 'DESATIVADO', 'EXCLUIDO', 'AGUARDANDO_AVALIACAO');

-- CreateEnum
CREATE TYPE "CategoriaProjeto" AS ENUM ('CATEGORIA_PADRAO', 'DESENVOLVIMENTO_CIENTIFICO_INSTITUCIONAL_E_TECNOLOGICO', 'FOMENTO_A_PESQUISA_CIENTIFICA_E_TECNOLOGICA', 'ESTUDOS_DE_CTI', 'SAUDE', 'BIOTECNOLOGIA', 'NANOTECNOLOGIA', 'BIOCOMBUSTIVEIS', 'ENERGIA_ELETRICA', 'ENERGIAS_RENOVAVEIS', 'PETROLEO_E_GAS', 'AGRONEGOCIO', 'BIODIVERSIDADE_E_RECURSOS_NATURAIS', 'RECURSOS_HIDRICOS', 'SEMIARIDO', 'AQUICULTURA_E_PESCA', 'METEOROLOGIA_E_MUDANCAS_CLIMATICAS', 'TECNOLOGIA_INDUSTRIAL', 'SEGURANCA_PUBLICA', 'TECNOLOGIA_SOCIAL', 'DESIGN', 'TECNOLOGIA_INCLUSIVA', 'ECONOMIA_CRIATIVA', 'INOVACAO', 'PROGRAMAS_DE_COMPUTADOR', 'MODELOS_DE_UTILIDADE', 'NOVA_CULTIVAR', 'CULTIVAR_DERIVADA', 'AGROINDUSTRIA', 'DESENHO_INDUSTRIAL', 'TOPOGRAFIA_DE_CIRCUITO_INDUSTRIAL', 'DESENVOLVIMENTO_DE_TECNOLOGIA', 'DESENVOLVIMENTO_DE_PRODUTO', 'DESENVOLVIMENTO_DE_PROCESSO', 'APERFEICOAMENTO_DE_TECNOLOGIA', 'APERFEICOAMENTO_DE_PROCESSO', 'APERFEICOAMENTO_DE_PRODUTO', 'SERVICO_INOVADOR', 'PESQUISA_CIENTIFICA', 'PESQUISA_BASICA', 'PESQUISA_APLICADA');

-- DropForeignKey
ALTER TABLE "atividade" DROP CONSTRAINT "atividade_mes_id_fkey";

-- DropForeignKey
ALTER TABLE "cronograma" DROP CONSTRAINT "cronograma_atividade_id_fkey";

-- DropForeignKey
ALTER TABLE "plano_trabalho" DROP CONSTRAINT "plano_trabalho_corpo_id_fkey";

-- DropForeignKey
ALTER TABLE "plano_trabalho" DROP CONSTRAINT "plano_trabalho_cronograma_id_fkey";

-- DropForeignKey
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_corpo_id_fkey";

-- DropForeignKey
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_cronograma_id_fkey";

-- DropForeignKey
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_localidade_id_fkey";

-- DropForeignKey
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_palavra_chave_id_fkey";

-- DropForeignKey
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_plano_trabalho_id_fkey";

-- AlterTable
ALTER TABLE "corpo_plano_trabalho" ADD COLUMN     "plano_trabalho_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "corpo_projeto" ADD COLUMN     "abstract" TEXT NOT NULL,
ADD COLUMN     "projeto_pesquisa_id" INTEGER NOT NULL,
ADD COLUMN     "resultados_esperados" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "palavra_chave" ADD COLUMN     "projeto_pesquisaId" INTEGER,
DROP COLUMN "lingua",
ADD COLUMN     "lingua" "Idioma" NOT NULL;

-- AlterTable
ALTER TABLE "plano_trabalho" ADD COLUMN     "pesquisa_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "projeto_pesquisa" DROP COLUMN "corpo_id",
DROP COLUMN "cronograma_id",
DROP COLUMN "localidade_id",
DROP COLUMN "palavra_chave_id",
DROP COLUMN "plano_trabalho_id",
ADD COLUMN     "data_cadastro" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "unidade_id" INTEGER NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoProjeto" NOT NULL,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "CategoriaProjeto" NOT NULL,
DROP COLUMN "situação",
ADD COLUMN     "situação" "SituacaoProjeto" NOT NULL,
ALTER COLUMN "area_conhecimento_id" DROP NOT NULL,
ALTER COLUMN "edital" DROP NOT NULL,
ALTER COLUMN "cota" DROP NOT NULL;

-- DropTable
DROP TABLE "atividade";

-- DropTable
DROP TABLE "cronograma";

-- DropTable
DROP TABLE "localidade";

-- DropTable
DROP TABLE "mes";

-- CreateTable
CREATE TABLE "atividade_projeto_pesquisa" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "projeto_pesquisa_id" INTEGER,

    CONSTRAINT "atividade_projeto_pesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mes_projeto_pesquisa" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "mes_projeto_pesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade_plano_trabalho" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "plano_trabalho_id" INTEGER,

    CONSTRAINT "atividade_plano_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mes_plano_trabalho" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "atividade_id" INTEGER NOT NULL,
    "atividade_plano_trabalhoId" INTEGER,

    CONSTRAINT "mes_plano_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidade_academica" (
    "id" SERIAL NOT NULL,
    "sigla" VARCHAR(15) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidade_academica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unidade_academica_sigla_key" ON "unidade_academica"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "unidade_academica_nome_key" ON "unidade_academica"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "corpo_plano_trabalho_plano_trabalho_id_key" ON "corpo_plano_trabalho"("plano_trabalho_id");

-- CreateIndex
CREATE UNIQUE INDEX "corpo_projeto_projeto_pesquisa_id_key" ON "corpo_projeto"("projeto_pesquisa_id");

-- AddForeignKey
ALTER TABLE "atividade_projeto_pesquisa" ADD CONSTRAINT "atividade_projeto_pesquisa_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mes_projeto_pesquisa" ADD CONSTRAINT "mes_projeto_pesquisa_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade_projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "atividade_plano_trabalho" ADD CONSTRAINT "atividade_plano_trabalho_plano_trabalho_id_fkey" FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mes_plano_trabalho" ADD CONSTRAINT "mes_plano_trabalho_atividade_plano_trabalhoId_fkey" FOREIGN KEY ("atividade_plano_trabalhoId") REFERENCES "atividade_plano_trabalho"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpo_plano_trabalho" ADD CONSTRAINT "corpo_plano_trabalho_plano_trabalho_id_fkey" FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpo_projeto" ADD CONSTRAINT "corpo_projeto_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palavra_chave" ADD CONSTRAINT "palavra_chave_projeto_pesquisaId_fkey" FOREIGN KEY ("projeto_pesquisaId") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_pesquisa_id_fkey" FOREIGN KEY ("pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade_academica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
