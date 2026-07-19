-- CreateTable
CREATE TABLE "anexo_edital" (
    "id" SERIAL NOT NULL,
    "edital_id" INTEGER NOT NULL,
    "arquivo" BYTEA NOT NULL,
    "tipo" VARCHAR(255) NOT NULL,

    CONSTRAINT "anexo_edital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anexo_edital_edital_id_key" ON "anexo_edital"("edital_id");

-- AddForeignKey
ALTER TABLE "anexo_edital" ADD CONSTRAINT "anexo_edital_edital_id_fkey" FOREIGN KEY ("edital_id") REFERENCES "edital"("id") ON DELETE CASCADE ON UPDATE CASCADE;
