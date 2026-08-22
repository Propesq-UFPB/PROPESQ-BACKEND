-- Unify ADMIN into GESTOR.
-- FKs usuario.funcao_id and funcao_permissao.funcao_id are ON DELETE NO ACTION.

DELETE FROM "funcao_permissao"
WHERE "funcao_id" = (SELECT "id" FROM "funcao" WHERE "nome" = 'ADMIN');

UPDATE "usuario" AS u
SET "funcao_id" = g."id"
FROM "funcao" AS g, "funcao" AS a
WHERE g."nome" = 'GESTOR'
  AND a."nome" = 'ADMIN'
  AND u."funcao_id" = a."id";

DELETE FROM "funcao" WHERE "nome" = 'ADMIN';
