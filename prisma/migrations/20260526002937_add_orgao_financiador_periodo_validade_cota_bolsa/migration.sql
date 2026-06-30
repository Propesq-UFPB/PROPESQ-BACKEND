/*
  Warnings:

  - Added the required column `orgao_financiador` to the `cota_bolsa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo_validade_id` to the `cota_bolsa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cota_bolsa" ADD COLUMN     "orgao_financiador" TEXT NOT NULL,
ADD COLUMN     "periodo_validade_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "cota_bolsa" ADD CONSTRAINT "cota_bolsa_periodo_validade_id_fkey" FOREIGN KEY ("periodo_validade_id") REFERENCES "periodo_cota_bolsa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
