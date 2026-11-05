-- Renomeia o cadastro "consultor" para "avaliador", preservando os dados.
--
-- projeto_avaliacao.consultor_id é removido: era redundante com
-- projeto_avaliacao.avaliador_id (usuário avaliador), já que avaliador.usuario_id é único.
-- Antes de remover, garante que nenhuma atribuição aponta para um usuário diferente do cadastro.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "projeto_avaliacao" pa
    JOIN "consultor" c ON c."id" = pa."consultor_id"
    WHERE c."usuario_id" <> pa."avaliador_id"
  ) THEN
    RAISE EXCEPTION 'projeto_avaliacao.consultor_id inconsistente com avaliador_id';
  END IF;
END $$;

ALTER TABLE "projeto_avaliacao" DROP CONSTRAINT "projeto_avaliacao_consultor_id_fkey";
DROP INDEX "projeto_avaliacao_consultor_id_idx";
ALTER TABLE "projeto_avaliacao" DROP COLUMN "consultor_id";

-- consultor -> avaliador
ALTER TABLE "consultor" RENAME TO "avaliador";
ALTER SEQUENCE "consultor_id_seq" RENAME TO "avaliador_id_seq";
ALTER TABLE "avaliador" RENAME CONSTRAINT "consultor_pkey" TO "avaliador_pkey";
ALTER TABLE "avaliador" RENAME CONSTRAINT "consultor_usuario_id_fkey" TO "avaliador_usuario_id_fkey";
ALTER TABLE "avaliador" RENAME CONSTRAINT "consultor_area_principal_id_fkey" TO "avaliador_area_principal_id_fkey";
ALTER INDEX "consultor_usuario_id_key" RENAME TO "avaliador_usuario_id_key";

-- consultor_area_adicional -> avaliador_area_adicional
ALTER TABLE "consultor_area_adicional" RENAME TO "avaliador_area_adicional";
ALTER SEQUENCE "consultor_area_adicional_id_seq" RENAME TO "avaliador_area_adicional_id_seq";
ALTER TABLE "avaliador_area_adicional" RENAME COLUMN "consultor_id" TO "avaliador_id";
ALTER TABLE "avaliador_area_adicional" RENAME CONSTRAINT "consultor_area_adicional_pkey" TO "avaliador_area_adicional_pkey";
ALTER TABLE "avaliador_area_adicional" RENAME CONSTRAINT "consultor_area_adicional_consultor_id_fkey" TO "avaliador_area_adicional_avaliador_id_fkey";
ALTER TABLE "avaliador_area_adicional" RENAME CONSTRAINT "consultor_area_adicional_area_conhecimento_id_fkey" TO "avaliador_area_adicional_area_conhecimento_id_fkey";
ALTER INDEX "consultor_area_adicional_area_conhecimento_id_idx" RENAME TO "avaliador_area_adicional_area_conhecimento_id_idx";
ALTER INDEX "consultor_area_adicional_consultor_id_area_conhecimento_id_key" RENAME TO "avaliador_area_adicional_avaliador_id_area_conhecimento_id_key";

-- edital_consultor -> edital_avaliador
ALTER TABLE "edital_consultor" RENAME TO "edital_avaliador";
ALTER SEQUENCE "edital_consultor_id_seq" RENAME TO "edital_avaliador_id_seq";
ALTER TABLE "edital_avaliador" RENAME COLUMN "consultor_id" TO "avaliador_id";
ALTER TABLE "edital_avaliador" RENAME CONSTRAINT "edital_consultor_pkey" TO "edital_avaliador_pkey";
ALTER TABLE "edital_avaliador" RENAME CONSTRAINT "edital_consultor_edital_id_fkey" TO "edital_avaliador_edital_id_fkey";
ALTER TABLE "edital_avaliador" RENAME CONSTRAINT "edital_consultor_consultor_id_fkey" TO "edital_avaliador_avaliador_id_fkey";
ALTER INDEX "edital_consultor_consultor_id_idx" RENAME TO "edital_avaliador_avaliador_id_idx";
ALTER INDEX "edital_consultor_edital_id_consultor_id_key" RENAME TO "edital_avaliador_edital_id_avaliador_id_key";
