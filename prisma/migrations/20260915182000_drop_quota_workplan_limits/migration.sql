-- Drop global quota/work-plan request limit columns from module parameters.
ALTER TABLE "parametro_modulo_pesquisa"
  DROP COLUMN IF EXISTS "max_quota_requests_per_project",
  DROP COLUMN IF EXISTS "max_work_plans_per_advisor";
