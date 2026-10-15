-- CreateEnum
CREATE TYPE "StatusAtribuicao" AS ENUM ('PENDENTE', 'ACEITO', 'RECUSADO');

-- AlterTable
ALTER TABLE "projeto_avaliacao" ADD COLUMN     "motivo_recusa" TEXT,
ADD COLUMN     "respondido_em" TIMESTAMP(6),
ADD COLUMN     "status" "StatusAtribuicao" NOT NULL DEFAULT 'PENDENTE';

-- Atribuições que já receberam notas foram, na prática, aceitas pelo avaliador
UPDATE "projeto_avaliacao" pa
SET "status" = 'ACEITO', "respondido_em" = pa."atualizado_em"
WHERE EXISTS (SELECT 1 FROM "avaliacao_nota" n WHERE n."avaliacao_id" = pa."id")
   OR EXISTS (
     SELECT 1 FROM "plano_avaliacao" pl
     JOIN "avaliacao_nota" n ON n."plano_avaliacao_id" = pl."id"
     WHERE pl."projeto_avaliacao_id" = pa."id"
   );
