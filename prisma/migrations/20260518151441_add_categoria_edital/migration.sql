-- CreateTable
CREATE TABLE "categoria_edital" (
    "id" SERIAL NOT NULL,
    "denominacao" VARCHAR(255) NOT NULL,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL,

    CONSTRAINT "categoria_edital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_edital_denominacao_key" ON "categoria_edital"("denominacao");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_edital_ordem_key" ON "categoria_edital"("ordem");
