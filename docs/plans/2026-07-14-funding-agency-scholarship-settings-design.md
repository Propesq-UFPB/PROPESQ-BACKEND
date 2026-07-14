# Funding agencies + scholarship settings

**Date:** 2026-07-14  
**Status:** Approved (INTAKE complete; implementation session)

## Problem

Admin settings screen (`ScholarshipEntities`) manages funding agencies (órgãos) and scholarship types with local mock data. Backend has no `orgao` entity; `cota_bolsa.orgao_financiador` is free text; `bolsa` has no link to an agency.

## Goals

1. Persist `orgao_financiador` as first-class entity with Nest CRUD at `/funding-agencies`.
2. Extend `bolsa` with `orgao_id` (nullable), `valor`, `permite_acumulo`.
3. Add `POST /scholarships/from-settings` for settings UI creates (defaults for technical fields).
4. Wire front settings page to real APIs.

## Non-goals (deferred)

- Migrate `cota_bolsa.orgao_financiador` string → FK
- Soft-delete
- Full bolsa field UI in settings
- Replace string `tipoBolsa` in CreateCall / work plans with IDs

## Data model

```prisma
model orgao_financiador {
  id            Int      @id @default(autoincrement())
  nome          String   @unique @db.VarChar(255)
  criado_em     DateTime @default(now()) @db.Timestamp(6)
  atualizado_em DateTime @default(now()) @updatedAt @db.Timestamp(6)
  bolsas        bolsa[]
}

// bolsa additions:
// orgao_id Int?
// orgao orgao_financiador? @relation(..., onDelete: Restrict)
// valor Decimal? @db.Decimal(12, 2)
// permite_acumulo Boolean @default(false)
```

## API contracts

### Funding agencies (`/funding-agencies`)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/` | ADMIN, GESTOR |
| GET | `/?limit&offset` | JWT |
| GET | `/lookup` | JWT → `{ id, name }` |
| GET | `/:id` | JWT |
| PATCH | `/:id` | ADMIN, GESTOR |
| DELETE | `/:id` | ADMIN, GESTOR; 409 if any `bolsa.orgao_id` references |

Body: `{ nome: string }`. Unique nome → 409.

### Scholarships

- Full `POST /scholarships` unchanged except optional `orgao_id`, `valor`, `permite_acumulo`.
- `POST /scholarships/from-settings` (ADMIN, GESTOR): `{ descricao, orgao_id, valor?, permite_acumulo? }`
  - Defaults: `categoria=descricao`, days 15/20, `niveis="111"`, flags false, report period Jan 1–Dec 31 current year.
- Response includes `orgao_id`, `valor`, `permite_acumulo`, nested `orgao?: { id, nome }`.
- Writes (create/patch/delete/from-settings): ADMIN, GESTOR.

## Frontend mapping

| UI | API |
|----|-----|
| Org.name | nome |
| Type.name | descricao |
| Type.value | valor |
| Type.payerOrgId | orgao_id |
| Type.allowStacking | permite_acumulo |

Services: `fundingAgencyService`, `scholarshipSettingsService` via `apiClient`.

## Decision log

| ID | Decision |
|----|----------|
| Q1 | Extend bolsa (not new tipo_bolsa entity) |
| Q2 | Settings create with service defaults |
| Q3 | Defer cota_bolsa FK |
| Q4 | Hard delete + block org if in use |
| Q5 | orgao_id nullable |
| Q6 | ADMIN+GESTOR writes |
| Q7 | `/funding-agencies` + Prisma `orgao_financiador` |
| Q8 | Dedicated `from-settings` endpoint |

## Test plan

- FundingAgencyService: create, unique conflict, delete in-use conflict, not found
- ScholarshipService: from-settings defaults, missing orgao → 404
- `npm test`, `npm run lint`, `npm run build` (backend + front)

## Spec review (self-eval)

| Criterion | Score |
|-----------|-------|
| Completeness | 5 |
| Consistency | 5 |
| Clarity | 4 |
| Scope | 5 |
| Testability | 4 |
| **Average** | **4.6** |

Approved (≥ 4.0).
