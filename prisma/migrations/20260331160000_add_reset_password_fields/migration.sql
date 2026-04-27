-- AlterTable
ALTER TABLE "usuario"
ADD COLUMN "reset_token" TEXT;
ALTER TABLE "usuario"
ADD COLUMN "reset_token_expires" TIMESTAMP(6);
-- CreateIndex
CREATE UNIQUE INDEX "usuario_reset_token_key" ON "usuario"("reset_token");