-- CreateTable
CREATE TABLE "avaliador" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "area_conhecimento_principal_id" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "is_propesq" BOOLEAN NOT NULL DEFAULT false,
    "is_voluntario" BOOLEAN NOT NULL DEFAULT false,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliador_area_conhecimento_adicional" (
    "id" SERIAL NOT NULL,
    "avaliador_id" INTEGER NOT NULL,
    "area_conhecimento_id" INTEGER NOT NULL,

    CONSTRAINT "avaliador_area_conhecimento_adicional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avaliador_usuario_id_key" ON "avaliador"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliador_area_conhecimento_adicional_avaliador_id_area_con_key" ON "avaliador_area_conhecimento_adicional"("avaliador_id", "area_conhecimento_id");

-- AddForeignKey
ALTER TABLE "avaliador" ADD CONSTRAINT "avaliador_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliador" ADD CONSTRAINT "avaliador_area_conhecimento_principal_id_fkey" FOREIGN KEY ("area_conhecimento_principal_id") REFERENCES "area_conhecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliador_area_conhecimento_adicional" ADD CONSTRAINT "avaliador_area_conhecimento_adicional_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "avaliador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliador_area_conhecimento_adicional" ADD CONSTRAINT "avaliador_area_conhecimento_adicional_area_conhecimento_id_fkey" FOREIGN KEY ("area_conhecimento_id") REFERENCES "area_conhecimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
