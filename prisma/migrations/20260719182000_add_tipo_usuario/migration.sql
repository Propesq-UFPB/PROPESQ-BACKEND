-- CreateEnum
CREATE TYPE "PublicoAlvo" AS ENUM ('DOCENTE', 'TECNICO_ADMINISTRATIVO', 'POS_DOUTORANDO', 'DISCENTE_UFPB_MEDIO', 'DISCENTE_UFPB_SUPERIOR', 'DISCENTE_EXTERNO_SEM_SIGAA');

-- CreateTable
CREATE TABLE "tipo_usuario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "publicos" "PublicoAlvo"[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipo_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_usuario_nome_key" ON "tipo_usuario"("nome");
