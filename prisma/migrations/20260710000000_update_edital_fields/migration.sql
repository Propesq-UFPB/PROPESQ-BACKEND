ALTER TABLE "edital"
ADD COLUMN "divulgar_resultado" BOOLEAN NOT NULL DEFAULT false;

UPDATE "edital" AS e
SET "divulgar_resultado" = COALESCE(
  (
    SELECT BOOL_OR(ecd."divulgar_resultado")
    FROM "edital_cota_distribuicao" AS ecd
    WHERE ecd."id_edital" = e."id"
  ),
  false
);

ALTER TABLE "edital"
DROP COLUMN "validar_indice_min",
DROP COLUMN "valor_indice_min",
DROP COLUMN "edital_para_voluntarios",
DROP COLUMN "apenas_colab_vol_cadastra_plano",
DROP COLUMN "prof_subst_cadastra_proj",
DROP COLUMN "periodo_correcao_plano_id";

ALTER TABLE "edital_cota_distribuicao"
DROP COLUMN "divulgar_resultado";

DROP TYPE "TipoIndiceMin";
DROP TYPE "TipoPeriodoEdital";
