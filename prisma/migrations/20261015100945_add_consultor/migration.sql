-- AlterTable
ALTER TABLE "projeto_avaliacao" ADD COLUMN     "consultor_id" INTEGER;

-- CreateTable
CREATE TABLE "edital_consultor" (
    "id" SERIAL NOT NULL,
    "edital_id" INTEGER NOT NULL,
    "consultor_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edital_consultor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultor" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "is_propesq" BOOLEAN NOT NULL DEFAULT false,
    "is_voluntario" BOOLEAN NOT NULL DEFAULT false,
    "is_cnpq" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "area_principal_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultor_area_adicional" (
    "id" SERIAL NOT NULL,
    "consultor_id" INTEGER NOT NULL,
    "area_conhecimento_id" INTEGER NOT NULL,

    CONSTRAINT "consultor_area_adicional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "edital_consultor_consultor_id_idx" ON "edital_consultor"("consultor_id");

-- CreateIndex
CREATE UNIQUE INDEX "edital_consultor_edital_id_consultor_id_key" ON "edital_consultor"("edital_id", "consultor_id");

-- CreateIndex
CREATE UNIQUE INDEX "consultor_usuario_id_key" ON "consultor"("usuario_id");

-- CreateIndex
CREATE INDEX "consultor_area_adicional_area_conhecimento_id_idx" ON "consultor_area_adicional"("area_conhecimento_id");

-- CreateIndex
CREATE UNIQUE INDEX "consultor_area_adicional_consultor_id_area_conhecimento_id_key" ON "consultor_area_adicional"("consultor_id", "area_conhecimento_id");

-- CreateIndex
CREATE INDEX "projeto_avaliacao_consultor_id_idx" ON "projeto_avaliacao"("consultor_id");

-- AddForeignKey
ALTER TABLE "edital_consultor" ADD CONSTRAINT "edital_consultor_edital_id_fkey" FOREIGN KEY ("edital_id") REFERENCES "edital"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edital_consultor" ADD CONSTRAINT "edital_consultor_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "consultor"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projeto_avaliacao" ADD CONSTRAINT "projeto_avaliacao_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "consultor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultor" ADD CONSTRAINT "consultor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultor" ADD CONSTRAINT "consultor_area_principal_id_fkey" FOREIGN KEY ("area_principal_id") REFERENCES "area_conhecimento"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultor_area_adicional" ADD CONSTRAINT "consultor_area_adicional_consultor_id_fkey" FOREIGN KEY ("consultor_id") REFERENCES "consultor"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultor_area_adicional" ADD CONSTRAINT "consultor_area_adicional_area_conhecimento_id_fkey" FOREIGN KEY ("area_conhecimento_id") REFERENCES "area_conhecimento"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
