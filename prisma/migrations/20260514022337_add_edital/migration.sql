-- DropForeignKey
ALTER TABLE "edital_cota_distribuicao" DROP CONSTRAINT "edital_cota_distribuicao_id_edital_fkey";

-- AddForeignKey
ALTER TABLE "edital_cota_distribuicao" ADD CONSTRAINT "edital_cota_distribuicao_id_edital_fkey" FOREIGN KEY ("id_edital") REFERENCES "edital"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
