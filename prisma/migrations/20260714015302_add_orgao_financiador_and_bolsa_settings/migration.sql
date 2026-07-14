-- CreateTable
CREATE TABLE "orgao_financiador" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orgao_financiador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orgao_financiador_nome_key" ON "orgao_financiador"("nome");

-- AlterTable
ALTER TABLE "bolsa" ADD COLUMN     "orgao_id" INTEGER,
ADD COLUMN     "valor" DECIMAL(12,2),
ADD COLUMN     "permite_acumulo" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "bolsa" ADD CONSTRAINT "bolsa_orgao_id_fkey" FOREIGN KEY ("orgao_id") REFERENCES "orgao_financiador"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
