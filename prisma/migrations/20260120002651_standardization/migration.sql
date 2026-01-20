/*
  Warnings:

  - You are about to drop the column `titulo_ingles` on the `corpo_plano_trabalho` table. All the data in the column will be lost.
  - You are about to drop the column `resumo_ingles` on the `corpo_projeto` table. All the data in the column will be lost.
  - You are about to drop the column `palavra_chave_ingles_id` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `situacao` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - You are about to drop the column `titulo_ingles` on the `projeto_pesquisa` table. All the data in the column will be lost.
  - Added the required column `situação` to the `projeto_pesquisa` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "anexo_projeto_pesquisa_id_key";

-- AlterTable
CREATE SEQUENCE anexo_id_seq;
ALTER TABLE "anexo" ALTER COLUMN "id" SET DEFAULT nextval('anexo_id_seq');
ALTER SEQUENCE anexo_id_seq OWNED BY "anexo"."id";

-- AlterTable
CREATE SEQUENCE anexo_projeto_pesquisa_id_seq;
ALTER TABLE "anexo_projeto_pesquisa" ALTER COLUMN "id" SET DEFAULT nextval('anexo_projeto_pesquisa_id_seq');
ALTER SEQUENCE anexo_projeto_pesquisa_id_seq OWNED BY "anexo_projeto_pesquisa"."id";

-- AlterTable
CREATE SEQUENCE atividade_id_seq;
ALTER TABLE "atividade" ALTER COLUMN "id" SET DEFAULT nextval('atividade_id_seq');
ALTER SEQUENCE atividade_id_seq OWNED BY "atividade"."id";

-- AlterTable
CREATE SEQUENCE corpo_plano_trabalho_id_seq;
ALTER TABLE "corpo_plano_trabalho" DROP COLUMN "titulo_ingles",
ALTER COLUMN "id" SET DEFAULT nextval('corpo_plano_trabalho_id_seq');
ALTER SEQUENCE corpo_plano_trabalho_id_seq OWNED BY "corpo_plano_trabalho"."id";

-- AlterTable
CREATE SEQUENCE corpo_projeto_id_seq;
ALTER TABLE "corpo_projeto" DROP COLUMN "resumo_ingles",
ALTER COLUMN "id" SET DEFAULT nextval('corpo_projeto_id_seq');
ALTER SEQUENCE corpo_projeto_id_seq OWNED BY "corpo_projeto"."id";

-- AlterTable
CREATE SEQUENCE cronograma_id_seq;
ALTER TABLE "cronograma" ALTER COLUMN "id" SET DEFAULT nextval('cronograma_id_seq');
ALTER SEQUENCE cronograma_id_seq OWNED BY "cronograma"."id";

-- AlterTable
CREATE SEQUENCE discente_id_seq;
ALTER TABLE "discente" ALTER COLUMN "id" SET DEFAULT nextval('discente_id_seq');
ALTER SEQUENCE discente_id_seq OWNED BY "discente"."id";

-- AlterTable
CREATE SEQUENCE docente_id_seq;
ALTER TABLE "docente" ALTER COLUMN "id" SET DEFAULT nextval('docente_id_seq');
ALTER SEQUENCE docente_id_seq OWNED BY "docente"."id";

-- AlterTable
CREATE SEQUENCE localidade_id_seq;
ALTER TABLE "localidade" ALTER COLUMN "id" SET DEFAULT nextval('localidade_id_seq');
ALTER SEQUENCE localidade_id_seq OWNED BY "localidade"."id";

-- AlterTable
CREATE SEQUENCE mes_id_seq;
ALTER TABLE "mes" ALTER COLUMN "id" SET DEFAULT nextval('mes_id_seq');
ALTER SEQUENCE mes_id_seq OWNED BY "mes"."id";

-- AlterTable
CREATE SEQUENCE plano_trabalho_id_seq;
ALTER TABLE "plano_trabalho" ALTER COLUMN "id" SET DEFAULT nextval('plano_trabalho_id_seq');
ALTER SEQUENCE plano_trabalho_id_seq OWNED BY "plano_trabalho"."id";

-- AlterTable
ALTER TABLE "projeto_pesquisa" DROP COLUMN "palavra_chave_ingles_id",
DROP COLUMN "situacao",
DROP COLUMN "titulo_ingles",
ADD COLUMN     "situação" TEXT NOT NULL,
ALTER COLUMN "area_conhecimento_id" DROP DEFAULT,
ALTER COLUMN "palavra_chave_id" DROP DEFAULT;
DROP SEQUENCE "projeto_pesquisa_area_conhecimento_id_seq";
DROP SEQUENCE "projeto_pesquisa_palavra_chave_id_seq";
