-- CreateTable
CREATE TABLE "edital_unidade_academica" (
    "id" SERIAL NOT NULL,
    "edital_id" INTEGER NOT NULL,
    "unidade_id" INTEGER NOT NULL,

    CONSTRAINT "edital_unidade_academica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamento" (
    "id" SERIAL NOT NULL,
    "sigla" VARCHAR(15) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "unidade_id" INTEGER NOT NULL,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "edital_unidade_academica_edital_id_unidade_id_key" ON "edital_unidade_academica"("edital_id", "unidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "departamento_unidade_id_sigla_key" ON "departamento"("unidade_id", "sigla");

-- CreateIndex
CREATE UNIQUE INDEX "departamento_unidade_id_nome_key" ON "departamento"("unidade_id", "nome");

-- AddForeignKey
ALTER TABLE "edital_unidade_academica" ADD CONSTRAINT "edital_unidade_academica_edital_id_fkey" FOREIGN KEY ("edital_id") REFERENCES "edital"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "edital_unidade_academica" ADD CONSTRAINT "edital_unidade_academica_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade_academica"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "departamento" ADD CONSTRAINT "departamento_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidade_academica"("id") ON DELETE CASCADE ON UPDATE CASCADE;
