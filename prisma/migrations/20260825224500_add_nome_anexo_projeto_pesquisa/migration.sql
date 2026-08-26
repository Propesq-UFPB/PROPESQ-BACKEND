ALTER TABLE "anexo_projeto_pesquisa"
ADD COLUMN "nome" VARCHAR(255);

UPDATE "anexo_projeto_pesquisa"
SET "nome" = 'projeto-' || "projeto_pesquisa_id" || '.pdf';

ALTER TABLE "anexo_projeto_pesquisa"
ALTER COLUMN "nome" SET NOT NULL;
