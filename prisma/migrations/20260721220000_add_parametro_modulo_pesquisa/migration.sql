-- CreateTable
CREATE TABLE "parametro_modulo_pesquisa" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "late_submission_tolerance_days" INTEGER NOT NULL DEFAULT 0,
    "max_renewals_per_project" INTEGER NOT NULL DEFAULT 0,
    "max_project_duration_months" INTEGER NOT NULL DEFAULT 12,
    "max_quota_requests_per_project" INTEGER NOT NULL DEFAULT 1,
    "max_work_plans_per_advisor" INTEGER NOT NULL DEFAULT 5,
    "scholarship_change_cutoff_day" INTEGER NOT NULL DEFAULT 20,
    "email_scholarship_changes" VARCHAR(255) NOT NULL DEFAULT '',
    "email_invention_notifications" VARCHAR(255) NOT NULL DEFAULT '',
    "allow_partial_reports_ic" BOOLEAN NOT NULL DEFAULT false,
    "allow_independent_enic_summaries" BOOLEAN NOT NULL DEFAULT false,
    "enic_summaries_per_reviewer" INTEGER NOT NULL DEFAULT 5,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parametro_modulo_pesquisa_pkey" PRIMARY KEY ("id")
);