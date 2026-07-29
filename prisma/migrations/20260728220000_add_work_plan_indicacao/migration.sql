-- CreateEnum
CREATE TYPE "StatusIndicacaoPlano" AS ENUM (
  'PENDENTE_INDICACAO',
  'DISCENTE_INDICADO',
  'AGUARDANDO_VALIDACAO',
  'INDICACAO_APROVADA',
  'INDICACAO_RECUSADA'
);

-- CreateEnum
CREATE TYPE "StatusInteressePlano" AS ENUM (
  'INTERESSE_REGISTRADO',
  'DOCUMENTACAO_PENDENTE',
  'APTO_PARA_INDICACAO'
);

-- CreateEnum
CREATE TYPE "TipoIndicacao" AS ENUM ('BOLSISTA', 'VOLUNTARIO');

-- CreateEnum
CREATE TYPE "StatusTermoCompromisso" AS ENUM (
  'NAO_ENVIADO',
  'AGUARDANDO_ACEITE',
  'ACEITO_PLATAFORMA',
  'PENDENTE_CORRECAO'
);

-- AlterTable
ALTER TABLE "plano_trabalho"
ADD COLUMN "status_indicacao" "StatusIndicacaoPlano" NOT NULL DEFAULT 'PENDENTE_INDICACAO',
ADD COLUMN "vagas" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "carga_horaria" INTEGER,
ADD COLUMN "prazo_indicacao" DATE,
ADD COLUMN "prazo_substituicao" DATE,
ADD COLUMN "tipo_indicacao" "TipoIndicacao",
ADD COLUMN "status_termo_compromisso" "StatusTermoCompromisso" DEFAULT 'NAO_ENVIADO';

-- CreateTable
CREATE TABLE "interesse_plano_trabalho" (
  "id" SERIAL NOT NULL,
  "plano_trabalho_id" INTEGER NOT NULL,
  "discente_id" INTEGER NOT NULL,
  "status" "StatusInteressePlano" NOT NULL DEFAULT 'INTERESSE_REGISTRADO',
  "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "interesse_plano_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_bancarios_indicacao" (
  "id" SERIAL NOT NULL,
  "plano_trabalho_id" INTEGER NOT NULL,
  "usuario_id" INTEGER,
  "banco" VARCHAR(255) NOT NULL,
  "agencia" VARCHAR(50) NOT NULL,
  "conta" VARCHAR(50) NOT NULL,
  "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "dados_bancarios_indicacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interesse_plano_trabalho_plano_trabalho_id_discente_id_key"
ON "interesse_plano_trabalho"("plano_trabalho_id", "discente_id");

-- CreateIndex
CREATE UNIQUE INDEX "dados_bancarios_indicacao_plano_trabalho_id_key"
ON "dados_bancarios_indicacao"("plano_trabalho_id");

-- AddForeignKey
ALTER TABLE "interesse_plano_trabalho"
ADD CONSTRAINT "interesse_plano_trabalho_plano_trabalho_id_fkey"
FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "interesse_plano_trabalho"
ADD CONSTRAINT "interesse_plano_trabalho_discente_id_fkey"
FOREIGN KEY ("discente_id") REFERENCES "discente"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dados_bancarios_indicacao"
ADD CONSTRAINT "dados_bancarios_indicacao_plano_trabalho_id_fkey"
FOREIGN KEY ("plano_trabalho_id") REFERENCES "plano_trabalho"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dados_bancarios_indicacao"
ADD CONSTRAINT "dados_bancarios_indicacao_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;
