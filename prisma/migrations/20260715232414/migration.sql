/*
  Warnings:

  - The values [SEM RESTRICOES,MESTRES,DOUTORES] on the enum `TitulacaoMin` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TitulacaoMin_new" AS ENUM ('GRADUACAO', 'ESPECIALIZACAO', 'MESTRADO', 'DOUTORADO');
ALTER TABLE "edital" ALTER COLUMN "titulacao_min" TYPE "TitulacaoMin_new" USING ("titulacao_min"::text::"TitulacaoMin_new");
ALTER TYPE "TitulacaoMin" RENAME TO "TitulacaoMin_old";
ALTER TYPE "TitulacaoMin_new" RENAME TO "TitulacaoMin";
DROP TYPE "public"."TitulacaoMin_old";
COMMIT;
