-- CreateEnum
CREATE TYPE "CategoriaFuncaoProjeto" AS ENUM ('ACADEMICO', 'BOLSA', 'EXTERNO', 'GESTAO', 'OUTRO');

-- CreateTable
CREATE TABLE "funcao_projeto" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "categoria" "CategoriaFuncaoProjeto" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcao_projeto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcao_projeto_nome_key" ON "funcao_projeto"("nome");
