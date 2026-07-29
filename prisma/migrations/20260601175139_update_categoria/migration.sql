/*
  Safe migration: categoria enum/text -> categoria_id FK.
  Handles existing projeto_pesquisa / edital rows by seeding a default category.
*/

-- Ensure at least one category exists for backfill
INSERT INTO "categoria_edital" ("denominacao", "ordem", "ativo")
SELECT 'CATEGORIA_PADRAO', 1, true
WHERE NOT EXISTS (SELECT 1 FROM "categoria_edital");

-- edital: add FK column, backfill, drop old column
ALTER TABLE "edital" ADD COLUMN IF NOT EXISTS "categoria_id" INTEGER;

UPDATE "edital" AS e
SET "categoria_id" = COALESCE(
  (
    SELECT c.id
    FROM "categoria_edital" AS c
    WHERE c.denominacao = e."categoria"::text
    LIMIT 1
  ),
  (SELECT id FROM "categoria_edital" ORDER BY id LIMIT 1)
)
WHERE "categoria_id" IS NULL;

ALTER TABLE "edital" ALTER COLUMN "categoria_id" SET NOT NULL;

ALTER TABLE "edital" DROP COLUMN IF EXISTS "categoria";

-- projeto_pesquisa: add FK column, backfill, drop old column
ALTER TABLE "projeto_pesquisa" ADD COLUMN IF NOT EXISTS "categoria_id" INTEGER;

UPDATE "projeto_pesquisa" AS p
SET "categoria_id" = COALESCE(
  (
    SELECT c.id
    FROM "categoria_edital" AS c
    WHERE c.denominacao = p."categoria"::text
    LIMIT 1
  ),
  (SELECT id FROM "categoria_edital" ORDER BY id LIMIT 1)
)
WHERE "categoria_id" IS NULL;

ALTER TABLE "projeto_pesquisa" ALTER COLUMN "categoria_id" SET NOT NULL;

ALTER TABLE "projeto_pesquisa" DROP COLUMN IF EXISTS "categoria";

-- Foreign keys (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'edital_categoria_id_fkey'
  ) THEN
    ALTER TABLE "edital"
      ADD CONSTRAINT "edital_categoria_id_fkey"
      FOREIGN KEY ("categoria_id") REFERENCES "categoria_edital"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projeto_pesquisa_categoria_id_fkey'
  ) THEN
    ALTER TABLE "projeto_pesquisa"
      ADD CONSTRAINT "projeto_pesquisa_categoria_id_fkey"
      FOREIGN KEY ("categoria_id") REFERENCES "categoria_edital"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
