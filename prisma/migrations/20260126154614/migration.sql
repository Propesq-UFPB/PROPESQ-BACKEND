-- CreateTable
CREATE TABLE "objetivo_desenvolvimento_sustentavel" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "objetivo_desenvolvimento_sustentavel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesquisa_objetivo" (
    "pesquisa_id" INTEGER NOT NULL,
    "objetivo_id" INTEGER NOT NULL,

    CONSTRAINT "pesquisa_objetivo_pkey" PRIMARY KEY ("pesquisa_id","objetivo_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "objetivo_desenvolvimento_sustentavel_tipo_key" ON "objetivo_desenvolvimento_sustentavel"("tipo");

-- AddForeignKey
ALTER TABLE "pesquisa_objetivo" ADD CONSTRAINT "pesquisa_objetivo_pesquisa_id_fkey" FOREIGN KEY ("pesquisa_id") REFERENCES "projeto_pesquisa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pesquisa_objetivo" ADD CONSTRAINT "pesquisa_objetivo_objetivo_id_fkey" FOREIGN KEY ("objetivo_id") REFERENCES "objetivo_desenvolvimento_sustentavel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
