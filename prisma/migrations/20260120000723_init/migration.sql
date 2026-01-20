-- CreateTable
CREATE TABLE "anexo" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "arquivo" BYTEA NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexo_projeto_pesquisa" (
    "id" BIGINT NOT NULL,
    "projeto_id" BIGINT NOT NULL,
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
    "meses" BIGINT NOT NULL,

    CONSTRAINT "atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpo_plano_trabalho" (
    "id" BIGINT NOT NULL,
    "titulo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
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
    "abstract" TEXT NOT NULL,
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
    "atividades" BIGINT NOT NULL,

    CONSTRAINT "cronograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discente" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "discente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docente" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,

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
    "date" DATE NOT NULL,

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
CREATE TABLE "permission" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_trabalho" (
    "id" BIGINT NOT NULL,
    "discent_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "modalidade" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL,
    "tipo_de_bolsa" VARCHAR(255) NOT NULL,
    "cronograma" BIGINT NOT NULL,
    "direcionamento_do_plano" TEXT NOT NULL,
    "corpo" BIGINT NOT NULL,

    CONSTRAINT "plano_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projeto_pesquisa" (
    "id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,
    "titulo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "situação" TEXT NOT NULL,
    "localidade" BIGINT NOT NULL,
    "area_do_conhecimentoID" BIGSERIAL NOT NULL,
    "palavras_chave" BIGSERIAL NOT NULL,
    "keywords" BIGSERIAL NOT NULL,
    "vigencia" TIMESTAMP(6) NOT NULL,
    "plano_de_trabalho" BIGINT NOT NULL,
    "corpo" BIGINT NOT NULL,
    "edital" TEXT NOT NULL,
    "cota" TEXT NOT NULL,
    "cronograma" BIGINT NOT NULL,

    CONSTRAINT "projeto_pesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL,
    "atualizado_em" TIMESTAMP(6) NOT NULL,
    "role_id" BIGINT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- AddForeignKey
ALTER TABLE "anexo" ADD CONSTRAINT "anexo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "atividade" ADD CONSTRAINT "atividade_meses_fkey" FOREIGN KEY ("meses") REFERENCES "mes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cronograma" ADD CONSTRAINT "cronograma_atividades_fkey" FOREIGN KEY ("atividades") REFERENCES "atividade"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discente" ADD CONSTRAINT "discente_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docente" ADD CONSTRAINT "docente_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_corpo_fkey" FOREIGN KEY ("corpo") REFERENCES "corpo_plano_trabalho"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_cronograma_fkey" FOREIGN KEY ("cronograma") REFERENCES "cronograma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_discent_id_fkey" FOREIGN KEY ("discent_id") REFERENCES "discente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_area_do_conhecimentoID_fkey" FOREIGN KEY ("area_do_conhecimentoID") REFERENCES "area_conhecimento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_corpo_fkey" FOREIGN KEY ("corpo") REFERENCES "corpo_projeto"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_cronograma_fkey" FOREIGN KEY ("cronograma") REFERENCES "cronograma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_id_fkey" FOREIGN KEY ("id") REFERENCES "anexo_projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_localidade_fkey" FOREIGN KEY ("localidade") REFERENCES "localidade"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_palavras_chave_fkey" FOREIGN KEY ("palavras_chave") REFERENCES "palavra_chave"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_plano_de_trabalho_fkey" FOREIGN KEY ("plano_de_trabalho") REFERENCES "plano_trabalho"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
