/*
  Warnings:

  - You are about to drop the column `area_conhecimento_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `corpo_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `cota` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `cronograma_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `edital` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `localidade_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `palavra_chave_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `plano_trabalho_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projeto_pesquisa_id]` on the table `corpo_projeto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `abstract` to the `corpo_projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projeto_pesquisa_id` to the `corpo_projeto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultados_esperados` to the `corpo_projeto` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `lingua` on the `palavra_chave` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `data_cadastro` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.
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
ALTER TABLE "projeto_pesquisa" DROP CONSTRAINT "projeto_pesquisa_area_conhecimento_id_fkey";

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
ALTER TABLE "corpo_projeto" ADD COLUMN     "abstract" TEXT NOT NULL,
ADD COLUMN     "projeto_pesquisa_id" INTEGER NOT NULL,
ADD COLUMN     "resultados_esperados" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "palavra_chave" ADD COLUMN     "projeto_pesquisaId" INTEGER,
DROP COLUMN "lingua",
ADD COLUMN     "lingua" "Idioma" NOT NULL;

-- AlterTable
ALTER TABLE "projeto_pesquisa" DROP COLUMN "area_conhecimento_id",
DROP COLUMN "corpo_id",
DROP COLUMN "cota",
DROP COLUMN "cronograma_id",
DROP COLUMN "edital",
DROP COLUMN "localidade_id",
DROP COLUMN "palavra_chave_id",
DROP COLUMN "plano_trabalho_id",
ADD COLUMN     "data_cadastro" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoProjeto" NOT NULL,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "CategoriaProjeto" NOT NULL,
DROP COLUMN "situação",
ADD COLUMN     "situação" "SituacaoProjeto" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "corpo_projeto_projeto_pesquisa_id_key" ON "corpo_projeto"("projeto_pesquisa_id");

-- AddForeignKey
ALTER TABLE "corpo_projeto" ADD CONSTRAINT "corpo_projeto_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palavra_chave" ADD CONSTRAINT "palavra_chave_projeto_pesquisaId_fkey" FOREIGN KEY ("projeto_pesquisaId") REFERENCES "projeto_pesquisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
