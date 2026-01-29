-- CreateEnum
CREATE TYPE "Idioma" AS ENUM ('PT', 'EN');

-- CreateEnum
CREATE TYPE "TipoProjeto" AS ENUM ('INTERNO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "SituacaoProjeto" AS ENUM ('CADASTRO_EM_ANDAMENTO', 'SUBMETIDO', 'AGUARDANDO_VALIDACAO', 'NECESSITA_CORRECAO', 'VALIDADO', 'NAO_VALIDADO', 'CADASTRADO', 'DISTRIBUIDO_PARA_AVALIACAO_AUTOMATICAMENTE', 'AVALIACAO_INSUFICIENTE', 'DISTRIBUICAO_PARA_AVALIACAO_MANUALMENTE', 'APROVADO', 'EM_EXECUCAO', 'CADASTRADO_SEM_PLANO', 'FINALIZADO_RENOVADO', 'FINALIZADO', 'REPROVADO', 'DESATIVADO', 'EXCLUIDO', 'AGUARDANDO_AVALIACAO');

-- CreateEnum
CREATE TYPE "CategoriaProjeto" AS ENUM ('CATEGORIA_PADRAO', 'DESENVOLVIMENTO_CIENTIFICO_INSTITUCIONAL_E_TECNOLOGICO', 'FOMENTO_A_PESQUISA_CIENTIFICA_E_TECNOLOGICA', 'ESTUDOS_DE_CTI', 'SAUDE', 'BIOTECNOLOGIA', 'NANOTECNOLOGIA', 'BIOCOMBUSTIVEIS', 'ENERGIA_ELETRICA', 'ENERGIAS_RENOVAVEIS', 'PETROLEO_E_GAS', 'AGRONEGOCIO', 'BIODIVERSIDADE_E_RECURSOS_NATURAIS', 'RECURSOS_HIDRICOS', 'SEMIARIDO', 'AQUICULTURA_E_PESCA', 'METEOROLOGIA_E_MUDANCAS_CLIMATICAS', 'TECNOLOGIA_INDUSTRIAL', 'SEGURANCA_PUBLICA', 'TECNOLOGIA_SOCIAL', 'DESIGN', 'TECNOLOGIA_INCLUSIVA', 'ECONOMIA_CRIATIVA', 'INOVACAO', 'PROGRAMAS_DE_COMPUTADOR', 'MODELOS_DE_UTILIDADE', 'NOVA_CULTIVAR', 'CULTIVAR_DERIVADA', 'AGROINDUSTRIA', 'DESENHO_INDUSTRIAL', 'TOPOGRAFIA_DE_CIRCUITO_INDUSTRIAL', 'DESENVOLVIMENTO_DE_TECNOLOGIA', 'DESENVOLVIMENTO_DE_PRODUTO', 'DESENVOLVIMENTO_DE_PROCESSO', 'APERFEICOAMENTO_DE_TECNOLOGIA', 'APERFEICOAMENTO_DE_PROCESSO', 'APERFEICOAMENTO_DE_PRODUTO', 'SERVICO_INOVADOR', 'PESQUISA_CIENTIFICA', 'PESQUISA_BASICA', 'PESQUISA_APLICADA');

-- CreateTable
CREATE TABLE "anexo" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "arquivo" BYTEA NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "anexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexo_projeto_pesquisa" (
    "id" SERIAL NOT NULL,
    "projeto_pesquisa_id" INTEGER NOT NULL,
    "arquivo" BYTEA NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,

    CONSTRAINT "anexo_projeto_pesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_conhecimento" (
    "id" SERIAL NOT NULL,
    "grande_area" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "sub_area" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,

    CONSTRAINT "area_conhecimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade" (
    "id" SERIAL NOT NULL,
    "atividade" INTEGER NOT NULL,
    "mes_id" INTEGER NOT NULL,

    CONSTRAINT "atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpo_plano_trabalho" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "introducao" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "metodologia" TEXT NOT NULL,
    "referencias" TEXT NOT NULL,

    CONSTRAINT "corpo_plano_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpo_projeto" (
    "id" SERIAL NOT NULL,
    "resumo" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "introducao" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "metodologia" TEXT NOT NULL,
    "referencias" TEXT NOT NULL,
    "resultados_esperados" TEXT NOT NULL,
    "projeto_pesquisa_id" INTEGER NOT NULL,

    CONSTRAINT "corpo_projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cronograma" (
    "id" SERIAL NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE NOT NULL,
    "atividade_id" INTEGER NOT NULL,

    CONSTRAINT "cronograma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discente" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "discente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docente" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidade_academica" (
    "id" SERIAL NOT NULL,
    "sigla" VARCHAR(15) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidade_academica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mes" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,

    CONSTRAINT "mes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palavra_chave" (
    "id" SERIAL NOT NULL,
    "palavra_chave" TEXT NOT NULL,
    "lingua" "Idioma" NOT NULL,
    "projeto_pesquisaId" INTEGER,

    CONSTRAINT "palavra_chave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_trabalho" (
    "id" SERIAL NOT NULL,
    "discente_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "modalidade" VARCHAR(255) NOT NULL,
    "status" TEXT NOT NULL,
    "tipo_bolsa" VARCHAR(255) NOT NULL,
    "cronograma_id" INTEGER NOT NULL,
    "direcionamento_plano" TEXT NOT NULL,
    "corpo_id" INTEGER NOT NULL,

    CONSTRAINT "plano_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projeto_pesquisa" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoProjeto" NOT NULL,
    "titulo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoria" "CategoriaProjeto" NOT NULL,
    "situação" "SituacaoProjeto" NOT NULL,
    "email" TEXT NOT NULL,
    "unidade_id" INTEGER NOT NULL,
    "vigencia" TIMESTAMP(6) NOT NULL,
    "data_cadastro" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projeto_pesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objetivo_desenvolvimento_sustentavel" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "objetivo_desenvolvimento_sustentavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisa_objetivo" (
    "pesquisa_id" INTEGER NOT NULL,
    "objetivo_id" INTEGER NOT NULL,

    CONSTRAINT "pesquisa_objetivo_pkey" PRIMARY KEY ("pesquisa_id","objetivo_id")
);

-- CreateTable
CREATE TABLE "funcao" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcao_permissao" (
    "funcao_id" INTEGER NOT NULL,
    "permissao_id" INTEGER NOT NULL,

    CONSTRAINT "funcao_permissao_pkey" PRIMARY KEY ("funcao_id","permissao_id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL,
    "atualizado_em" TIMESTAMP(6) NOT NULL,
    "funcao_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anexo_projeto_pesquisa_projeto_pesquisa_id_key" ON "anexo_projeto_pesquisa"("projeto_pesquisa_id");

-- CreateIndex
CREATE UNIQUE INDEX "corpo_projeto_projeto_pesquisa_id_key" ON "corpo_projeto"("projeto_pesquisa_id");

-- CreateIndex
CREATE UNIQUE INDEX "unidade_academica_sigla_key" ON "unidade_academica"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "unidade_academica_nome_key" ON "unidade_academica"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissao_nome_key" ON "permissao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "objetivo_desenvolvimento_sustentavel_tipo_key" ON "objetivo_desenvolvimento_sustentavel"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "funcao_nome_key" ON "funcao"("nome");

-- AddForeignKey
ALTER TABLE "anexo" ADD CONSTRAINT "anexo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anexo_projeto_pesquisa" ADD CONSTRAINT "anexo_projeto_pesquisa_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "atividade" ADD CONSTRAINT "atividade_mes_id_fkey" FOREIGN KEY ("mes_id") REFERENCES "mes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "corpo_projeto" ADD CONSTRAINT "corpo_projeto_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cronograma" ADD CONSTRAINT "cronograma_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discente" ADD CONSTRAINT "discente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docente" ADD CONSTRAINT "docente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "palavra_chave" ADD CONSTRAINT "palavra_chave_projeto_pesquisaId_fkey" FOREIGN KEY ("projeto_pesquisaId") REFERENCES "projeto_pesquisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_corpo_id_fkey" FOREIGN KEY ("corpo_id") REFERENCES "corpo_plano_trabalho"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_cronograma_id_fkey" FOREIGN KEY ("cronograma_id") REFERENCES "cronograma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_discente_id_fkey" FOREIGN KEY ("discente_id") REFERENCES "discente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plano_trabalho" ADD CONSTRAINT "plano_trabalho_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_pesquisa" ADD CONSTRAINT "projeto_pesquisa_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade_academica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesquisa_objetivo" ADD CONSTRAINT "pesquisa_objetivo_pesquisa_id_fkey" FOREIGN KEY ("pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pesquisa_objetivo" ADD CONSTRAINT "pesquisa_objetivo_objetivo_id_fkey" FOREIGN KEY ("objetivo_id") REFERENCES "objetivo_desenvolvimento_sustentavel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "funcao_permissao" ADD CONSTRAINT "funcao_permissao_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "permissao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "funcao_permissao" ADD CONSTRAINT "funcao_permissao_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "funcao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_funcao_id_fkey" FOREIGN KEY ("funcao_id") REFERENCES "funcao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
