-- AlterTable
ALTER TABLE "discente"
ADD COLUMN "matricula" VARCHAR(50),
ADD COLUMN "lattes_url" VARCHAR(500);

-- CreateTable
CREATE TABLE "perfil_discente" (
  "id" SERIAL NOT NULL,
  "discente_id" INTEGER NOT NULL,
  "data_nascimento" DATE,
  "sexo" VARCHAR(20),
  "raca" VARCHAR(50),
  "estado_civil" VARCHAR(50),
  "nacionalidade" VARCHAR(100),
  "naturalidade" VARCHAR(150),
  "tipo_sanguineo" VARCHAR(10),
  "nome_pai" VARCHAR(255),
  "nome_mae" VARCHAR(255),
  "cpf" VARCHAR(14),
  "rg" VARCHAR(30),
  "rg_emissao" DATE,
  "orgao_emissor" VARCHAR(50),
  "titulo_eleitor" VARCHAR(30),
  "zona_eleitoral" VARCHAR(10),
  "secao_eleitoral" VARCHAR(10),
  "certificado_militar" VARCHAR(50),
  "categoria_militar" VARCHAR(50),
  "cep" VARCHAR(12),
  "tipo_logradouro" VARCHAR(30),
  "logradouro" VARCHAR(255),
  "numero" VARCHAR(20),
  "complemento" VARCHAR(100),
  "bairro" VARCHAR(100),
  "uf" VARCHAR(50),
  "cidade" VARCHAR(100),
  "pais" VARCHAR(100),
  "telefone_ddd" VARCHAR(5),
  "telefone" VARCHAR(20),
  "celular_ddd" VARCHAR(5),
  "celular" VARCHAR(20),
  "curso" VARCHAR(255),
  "campus" VARCHAR(100),
  "periodo" VARCHAR(50),
  "semestre" VARCHAR(20),
  "cra" DECIMAL(4, 2),
  "creditos_concluidos" INTEGER,
  "reprovacoes" INTEGER,
  "situacao_academica" VARCHAR(50),
  "situacao_matricula" VARCHAR(50),
  "possui_necessidade" BOOLEAN NOT NULL DEFAULT false,
  "tipo_necessidade" VARCHAR(255),
  "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "perfil_discente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfil_discente_discente_id_key" ON "perfil_discente"("discente_id");

-- AddForeignKey
ALTER TABLE "perfil_discente"
ADD CONSTRAINT "perfil_discente_discente_id_fkey"
FOREIGN KEY ("discente_id") REFERENCES "discente"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
