/*
  Warnings:

  - Added the required column `cota_bolsa_id` to the `edital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "edital" ADD COLUMN     "cota_bolsa_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "edital" ADD CONSTRAINT "edital_cota_bolsa_id_fkey" FOREIGN KEY ("cota_bolsa_id") REFERENCES "cota_bolsa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
