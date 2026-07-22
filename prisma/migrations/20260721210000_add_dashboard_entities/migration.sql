-- CreateEnum
CREATE TYPE "TipoRelatorio" AS ENUM ('PARCIAL', 'FINAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "StatusRelatorio" AS ENUM ('PENDENTE', 'ENVIADO', 'APROVADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "membro_projeto" (
    "id" SERIAL NOT NULL,
    "projeto_pesquisa_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "funcao_projeto_id" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membro_projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio" (
    "id" SERIAL NOT NULL,
    "projeto_pesquisa_id" INTEGER NOT NULL,
    "tipo" "TipoRelatorio" NOT NULL,
    "status" "StatusRelatorio" NOT NULL DEFAULT 'PENDENTE',
    "prazo_fim" DATE NOT NULL,
    "enviado_em" TIMESTAMP(6),
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificado" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "projeto_pesquisa_id" INTEGER,
    "tipo" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(255) NOT NULL,
    "emitido_em" TIMESTAMP(6) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membro_projeto_projeto_pesquisa_id_usuario_id_funcao_projeto_key" ON "membro_projeto"("projeto_pesquisa_id", "usuario_id", "funcao_projeto_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificado_codigo_key" ON "certificado"("codigo");

-- AddForeignKey
ALTER TABLE "membro_projeto" ADD CONSTRAINT "membro_projeto_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membro_projeto" ADD CONSTRAINT "membro_projeto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "membro_projeto" ADD CONSTRAINT "membro_projeto_funcao_projeto_id_fkey" FOREIGN KEY ("funcao_projeto_id") REFERENCES "funcao_projeto"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certificado" ADD CONSTRAINT "certificado_projeto_pesquisa_id_fkey" FOREIGN KEY ("projeto_pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;