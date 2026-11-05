-- CreateEnum
CREATE TYPE "TipoAvaliador" AS ENUM ('INTERNO', 'EXTERNO');

-- AlterTable
ALTER TABLE "avaliador" ADD COLUMN     "tipo" "TipoAvaliador" NOT NULL DEFAULT 'INTERNO';

-- CreateTable
CREATE TABLE "avaliador_externo" (
    "avaliador_id" INTEGER NOT NULL,
    "instituicao" VARCHAR(255) NOT NULL,
    "titulacao" "TitulacaoMin",
    "cpf" VARCHAR(11),
    "pais" VARCHAR(100),
    "telefone" VARCHAR(30),
    "lattes_url" VARCHAR(500),
    "orcid" VARCHAR(19),
    "observacao" TEXT,

    CONSTRAINT "avaliador_externo_pkey" PRIMARY KEY ("avaliador_id")
);

-- CreateTable
CREATE TABLE "avaliador_acesso" (
    "id" SERIAL NOT NULL,
    "avaliador_id" INTEGER NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(6),
    "revogado_em" TIMESTAMP(6),
    "ultimo_acesso_em" TIMESTAMP(6),

    CONSTRAINT "avaliador_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avaliador_acesso_token_hash_key" ON "avaliador_acesso"("token_hash");

-- CreateIndex
CREATE INDEX "avaliador_acesso_avaliador_id_idx" ON "avaliador_acesso"("avaliador_id");

-- AddForeignKey
ALTER TABLE "avaliador_externo" ADD CONSTRAINT "avaliador_externo_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "avaliador"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliador_acesso" ADD CONSTRAINT "avaliador_acesso_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "avaliador"("id") ON DELETE CASCADE ON UPDATE NO ACTION;


-- Função dos usuários de sistema que representam avaliadores externos (sem login)
INSERT INTO "funcao" ("nome", "descricao", "atualizado_em")
VALUES ('AVALIADOR_EXTERNO', 'Avaliador externo: acessa apenas pelo link enviado pela PROPESQ', CURRENT_TIMESTAMP)
ON CONFLICT ("nome") DO NOTHING;
