-- CreateTable
CREATE TABLE "anexo" (
    "id" BIGINT NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "arquivo" BYTEA NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL,
    "atualizado_em" TIMESTAMP(6) NOT NULL,
    CONSTRAINT "anexo_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "anexo_projeto_pesquisa" (
    "id" BIGINT NOT NULL,
    "projeto_pesquisa_id" BIGINT NOT NULL,
    "arquivo" BYTEA NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,
    CONSTRAINT "anexo_projeto_pesquisa_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "area_conhecimento" (
    "id" BIGSERIAL NOT NULL,
    "grande_area" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "sub_area" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    CONSTRAINT "area_conhecimento_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "atividade" (
    "id" BIGINT NOT NULL,
    "atividade" BIGINT NOT NULL,
    "mes_id" BIGINT NOT NULL,
    CONSTRAINT "atividade_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "corpo_plano_trabalho" (
    "id" BIGINT NOT NULL,
    "titulo" TEXT NOT NULL,
    "titulo_ingles" TEXT NOT NULL,
    "introducao" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "metodologia" TEXT NOT NULL,
    "referencias" TEXT NOT NULL,
    CONSTRAINT "corpo_plano_trabalho_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "corpo_projeto" (
    "id" BIGINT NOT NULL,
    "resumo" TEXT NOT NULL,
    "resumo_ingles" TEXT NOT NULL,
    "introducao" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "metodologia" TEXT NOT NULL,
    "referencias" TEXT NOT NULL,
    CONSTRAINT "corpo_projeto_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "cronograma" (
    "id" BIGINT NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE NOT NULL,
    "atividade_id" BIGINT NOT NULL,
    CONSTRAINT "cronograma_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "discente" (
    "id" BIGINT NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    CONSTRAINT "discente_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "docente" (
    "id" BIGINT NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    CONSTRAINT "docente_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "localidade" (
    "id" BIGINT NOT NULL,
    "departamento" TEXT NOT NULL,
    "centro" TEXT NOT NULL,
    "unidade" BIGINT NOT NULL,
    CONSTRAINT "localidade_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "mes" (
    "id" BIGINT NOT NULL,
    "data" DATE NOT NULL,
    CONSTRAINT "mes_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "palavra_chave" (
    "id" BIGSERIAL NOT NULL,
    "palavra_chave" TEXT NOT NULL,
    "lingua" VARCHAR(255) NOT NULL,
    CONSTRAINT "palavra_chave_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "permissao" (
    "id" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissao_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "plano_trabalho" (
    "id" BIGINT NOT NULL,
    "discente_id" BIGINT NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "modalidade" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL,
    "tipo_bolsa" VARCHAR(255) NOT NULL,
    "cronograma_id" BIGINT NOT NULL,
    "direcionamento_plano" TEXT NOT NULL,
    "corpo_id" BIGINT NOT NULL,
    CONSTRAINT "plano_trabalho_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "projeto_pesquisa" (
    "id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,
    "titulo" TEXT NOT NULL,
    "titulo_ingles" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "situacao" TEXT NOT NULL,
    "localidade_id" BIGINT NOT NULL,
    "area_conhecimento_id" BIGSERIAL NOT NULL,
    "palavra_chave_id" BIGSERIAL NOT NULL,
    "palavra_chave_ingles_id" BIGSERIAL NOT NULL,
    "vigencia" TIMESTAMP(6) NOT NULL,
    "plano_trabalho_id" BIGINT NOT NULL,
    "corpo_id" BIGINT NOT NULL,
    "edital" TEXT NOT NULL,
    "cota" TEXT NOT NULL,
    "cronograma_id" BIGINT NOT NULL,
    CONSTRAINT "projeto_pesquisa_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "funcao" (
    "id" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "funcao_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "funcao_permissao" (
    "funcao_id" BIGINT NOT NULL,
    "permissao_id" BIGINT NOT NULL,
    CONSTRAINT "funcao_permissao_pkey" PRIMARY KEY ("funcao_id", "permissao_id")
);
-- CreateTable
CREATE TABLE "usuario" (
    "id" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL,
    "atualizado_em" TIMESTAMP(6) NOT NULL,
    "funcao_id" BIGINT NOT NULL,
    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "permissao_nome_key" ON "permissao"("nome");
-- CreateIndex
CREATE UNIQUE INDEX "funcao_nome_key" ON "funcao"("nome");
-- CreateIndex
CREATE UNIQUE INDEX "anexo_projeto_pesquisa_id_key" ON "anexo_projeto_pesquisa"("id");
-- CreateIndex
CREATE UNIQUE INDEX "anexo_projeto_pesquisa_projeto_pesquisa_id_key" ON "anexo_projeto_pesquisa"("projeto_pesquisa_id");
-- AddForeignKey
ALTER TABLE "anexo"
ADD CONSTRAINT "anexo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "anexo_projeto_pesquisa"
ADD CONSTRAINT "anexo_projeto_pesquisa_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "atividade"
ADD CONSTRAINT "atividade_mes_id_fkey" FOREIGN KEY ("mes_id") REFERENCES "mes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "cronograma"
ADD CONSTRAINT "cronograma_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "discente"
ADD CONSTRAINT "discente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "docente"
ADD CONSTRAINT "docente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "plano_trabalho"
ADD CONSTRAINT "plano_trabalho_corpo_id_fkey" FOREIGN KEY ("corpo_id") REFERENCES "corpo_plano_trabalho"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "plano_trabalho"
ADD CONSTRAINT "plano_trabalho_cronograma_id_fkey" FOREIGN KEY ("cronograma_id") REFERENCES "cronograma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "plano_trabalho"
ADD CONSTRAINT "plano_trabalho_discente_id_fkey" FOREIGN KEY ("discente_id") REFERENCES "discente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "plano_trabalho"
ADD CONSTRAINT "plano_trabalho_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "projeto_pesquisa"
ADD CONSTRAINT "projeto_pesquisa_area_conhecimento_id_fkey" FOREIGN KEY ("area_conhecimento_id") REFERENCES "area_conhecimento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "projeto_pesquisa"
ADD CONSTRAINT "projeto_pesquisa_corpo_id_fkey" FOREIGN KEY ("corpo_id") REFERENCES "corpo_projeto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "projeto_pesquisa"
ADD CONSTRAINT "projeto_pesquisa_cronograma_id_fkey" FOREIGN KEY ("cronograma_id") REFERENCES "cronograma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "projeto_pesquisa"
ADD CONSTRAINT "projeto_pesquisa_localidade_id_fkey" FOREIGN KEY ("localidade_id") REFERENCES "localidade"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "projeto_pesquisa"
ADD CONSTRAINT "projeto_pesquisa_palavra_chave_id_fkey" FOREIGN KEY ("palavra_chave_id") REFERENCES "palavra_chave"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "projeto_pesquisa"
ADD CONSTRAINT "projeto_pesquisa_plano_trabalho_id_fkey" FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "funcao_permissao"
ADD CONSTRAINT "funcao_permissao_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "permissao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "funcao_permissao"
ADD CONSTRAINT "funcao_permissao_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "funcao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- AddForeignKey
ALTER TABLE "usuario"
ADD CONSTRAINT "usuario_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "funcao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;