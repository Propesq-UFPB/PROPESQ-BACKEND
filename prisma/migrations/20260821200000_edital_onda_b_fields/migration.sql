-- AlterTable edital: ano + restored flags
ALTER TABLE "edital"
ADD COLUMN "ano" INTEGER,
ADD COLUMN "edital_para_voluntarios" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "apenas_colab_vol_cadastra_plano" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "prof_subst_cadastra_proj" BOOLEAN NOT NULL DEFAULT false;

UPDATE "edital"
SET "ano" = EXTRACT(YEAR FROM "data_cadastro")::integer
WHERE "ano" IS NULL;

ALTER TABLE "edital"
ALTER COLUMN "ano" SET NOT NULL;

-- AlterTable edital_cota_distribuicao: id_bolsa FK
ALTER TABLE "edital_cota_distribuicao"
ADD COLUMN "id_bolsa" INTEGER;

UPDATE "edital_cota_distribuicao" AS ecd
SET "id_bolsa" = (
  SELECT b."id" FROM "bolsa" AS b ORDER BY b."id" ASC LIMIT 1
)
WHERE ecd."id_bolsa" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "edital_cota_distribuicao" WHERE "id_bolsa" IS NULL) THEN
    RAISE EXCEPTION 'Cannot backfill id_bolsa: no rows in bolsa. Seed or create a bolsa first.';
  END IF;
END $$;

ALTER TABLE "edital_cota_distribuicao"
ALTER COLUMN "id_bolsa" SET NOT NULL;

ALTER TABLE "edital_cota_distribuicao"
ADD CONSTRAINT "edital_cota_distribuicao_id_bolsa_fkey"
FOREIGN KEY ("id_bolsa") REFERENCES "bolsa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
