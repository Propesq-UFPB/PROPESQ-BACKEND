ALTER TYPE "TipoEdital" RENAME TO "TipoEdital_old";

CREATE TYPE "TipoEdital" AS ENUM (
    'PESQUISA',
    'EXTENSAO',
    'ENSINO_POS_GRADUACAO',
    'OUTRO'
);

ALTER TABLE "edital"
ALTER COLUMN "tipo" TYPE "TipoEdital"
USING (
    CASE "tipo"::text
        WHEN 'PESQUISA' THEN 'PESQUISA'
        WHEN 'APOIO_GRP_PESQ' THEN 'OUTRO'
        WHEN 'APOIO_NOVO_PESQ' THEN 'OUTRO'
        ELSE 'OUTRO'
    END
)::"TipoEdital";

DROP TYPE "TipoEdital_old";
