-- Backfill: o coordenador de cada projeto já submetido passa a ser avaliador do edital do projeto.
-- (A partir daqui, o vínculo é feito na submissão, em ResearchService.create.)
--
-- O projeto não guarda quem o criou; usa-se o membro com função de coordenador nas duas tabelas
-- de equipe (projeto_membro, do assistente de submissão, e membro_projeto, do módulo antigo).
-- Só entra quem já tem cadastro de avaliador. O campo `ativo` não é alterado: avaliador
-- desativado é vinculado, mas segue fora da distribuição até ser reativado.
INSERT INTO "edital_avaliador" ("edital_id", "avaliador_id")
SELECT DISTINCT p."edital_id", a."id"
FROM "projeto_pesquisa" p
JOIN (
    SELECT pm."projeto_id", pm."user_id" AS "usuario_id"
    FROM "projeto_membro" pm
    WHERE pm."funcao" = 'COORDENADOR'
  UNION
    SELECT m."projeto_pesquisa_id", m."usuario_id"
    FROM "membro_projeto" m
    JOIN "funcao_projeto" f ON f."id" = m."funcao_projeto_id"
    WHERE f."nome" = 'Coordenador' AND m."ativo"
) c ON c."projeto_id" = p."id"
JOIN "avaliador" a ON a."usuario_id" = c."usuario_id"
WHERE p."edital_id" IS NOT NULL
  AND p."situação" NOT IN ('CADASTRO_EM_ANDAMENTO', 'EXCLUIDO')
ON CONFLICT ("edital_id", "avaliador_id") DO NOTHING;
