-- AlterTable
ALTER TABLE "docente" ADD COLUMN     "area_conhecimento_id" INTEGER;

-- AddForeignKey
ALTER TABLE "docente" ADD CONSTRAINT "docente_area_conhecimento_id_fkey" FOREIGN KEY ("area_conhecimento_id") REFERENCES "area_conhecimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
