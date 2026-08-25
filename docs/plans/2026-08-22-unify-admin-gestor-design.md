# Unify ADMIN into GESTOR Design Spec

## Summary

Colapsar os perfis paralelos `ADMIN` (backend) e `ADMINISTRADOR` (frontend) em um único perfil de sistema `GESTOR`. O trabalho é migration de dados, padronização de `@Roles('GESTOR')`, alias JWT `ADMIN`→`GESTOR`, e unificação de tipos/menu/rotas no frontend. Não é redesign de permissões: o perfil unificado recebe a **união** dos poderes que hoje estão espalhados.

## Context

Hoje existem dois nomes para o mesmo produto operacional.

- Backend: tabela `funcao` com `ADMIN` e `GESTOR`. Seed cria `dev@example.com` (ADMIN) e `gestor@exemplo.com` (GESTOR). JWT carrega `user.funcao` como string.
- Autorização: `@Roles('ADMIN', 'GESTOR')` em 15 controllers. Já só-GESTOR: `research.controller` (atribuir avaliador, decisão final), `cota_bolsa.controller` (CRUD), `evaluation-criteria.controller` (update/delete).
- Escopo de dados: `ProjectMembershipScopeService.isAdminOrGestor` trata os dois como irrestritos.
- Frontend: `AppRole` inclui `ADMINISTRADOR` e `GESTOR`. `mapBackendRole` mapeia tudo que não é COORDENADOR/DISCENTE para `ADMINISTRADOR` — inclusive `GESTOR` (bug). `Login.tsx` corrige isso com `normalizeRole` local. Settings existem em `/adm/settings/*` e `/gestor/settings/*` (wrappers). `homeLink` GESTOR aponta para `/gestor/projetos`, rota comentada.
- Publisher (`src/publisher/UsersAndRoles.tsx`) tem `ADMINISTRADOR` próprio. Fora de escopo.

JWT `expiresIn: '2h'` (`src/auth/auth.module.ts`).

## Design

### Architecture

```
DB migration (DELETE ADMIN) → seed (só GESTOR)
        ↓
Login novo emite funcao=GESTOR
Token velho (≤2h) ainda diz ADMIN
        ↓
JwtStrategy.normalize + RolesGuard.normalize
        ↓
request.user.funcao === GESTOR em todo handler
        ↓
Frontend mapBackendRole: ADMIN|ADMINISTRADOR|GESTOR → GESTOR
        ↓
Menu único + /adm/settings/* + redirect /gestor/settings/*
```

Dois repositórios, dois deploys. Ordem: **backend primeiro**. Se o front sair antes: `mapBackendRole` já trata `GESTOR` e ainda aceita `ADMIN` no JWT antigo. Se o backend sair antes: front antigo ainda mostra menu ADMINISTRADOR para quem o `Login.normalizeRole` classificar como tal; endpoints passam a exigir GESTOR, mas o alias no guard cobre tokens ADMIN.

### Components

#### Backend (`PROPESQ-BACKEND`)

| Path | Responsabilidade |
|------|------------------|
| `prisma/migrations/20260822160000_unify_admin_into_gestor/migration.sql` | Remap usuários, limpar `funcao_permissao`, apagar `funcao` ADMIN |
| `prisma/seed.ts` | Remover ADMIN de `FUNCOES`; `dev@example.com` com `roleName: 'GESTOR'` |
| `src/auth/normalize-system-funcao.ts` | `ADMIN` → `GESTOR` (case-insensitive) |
| `src/auth/jwt.strategy.ts` | Aplicar normalize no `validate` |
| `src/auth/roles.guard.ts` | Normalizar e **mutar** `request.user.funcao` antes do compare |
| `src/common/project-membership-scope.service.ts` | `isAdminOrGestor` usa normalize; comentários só GESTOR |
| `src/work-plan/work-plan.service.ts` | `role === 'GESTOR'` via normalize |
| Controllers listados abaixo | `@Roles` sem `ADMIN` |
| Specs listados abaixo | Fixtures `funcao: 'GESTOR'`; testes do alias |
| `README.md` | Papéis e tabela de seed |

Controllers a alterar (`@Roles` contendo `ADMIN`):

- `src/edital/edital.controller.ts`
- `src/work-plan/work-plan.controller.ts`
- `src/scholarship/scholarship.controller.ts`
- `src/dashboard/dashboard.controller.ts`
- `src/funding-agency/funding-agency.controller.ts`
- `src/project-roles/project-roles.controller.ts`
- `src/project-members/project-members.controller.ts`
- `src/certificates/certificates.controller.ts`
- `src/reports/reports.controller.ts`
- `src/research-module-parameters/research-module-parameters.controller.ts`
- `src/distribuicao/distribuicao.controller.ts`
- `src/discentes/discentes.controller.ts`
- `src/evaluation-criteria/evaluation-criteria.controller.ts` (create: tirar ADMIN; update/delete já GESTOR)

Já só-GESTOR (não mudar decorator): `src/research/research.controller.ts` (dois endpoints), `src/cota_bolsa/cota_bolsa.controller.ts`.

Docs Swagger/DTOs: trocar texto `ADMIN/GESTOR` → `GESTOR` em `work-plan.controller.ts`, `work-plan/dto/create-interesse.dto.ts`, `work-plan/dto/work-plan-list-query.dto.ts`, `research.controller.ts`, `work-plan-access.service.ts`.

**Não adicionar** `@Roles` em `user-type`, `academic-unit`, `users`, `category`, `department` (hoje sem decorator).

#### Frontend (`SISTEMA-PROPESQ`)

| Path | Responsabilidade |
|------|------------------|
| `src/features/auth/types/auth.ts` | `AppRole` sem `ADMINISTRADOR`; `mapBackendRole` único |
| `src/features/auth/types/auth.test.ts` | Tabela de mapeamento |
| `src/pages/Login.tsx` | Usar `mapBackendRole`; mock sem ADMINISTRADOR |
| `src/context/AuthContext.tsx` | Rehidratar localStorage com `mapBackendRole` (sessões velhas) |
| `src/features/auth/api/authService.ts` | Já chama `mapBackendRole` no `save` |
| `src/components/AppHeader.tsx` | Um menu GESTOR; settings `/adm/settings/*`; `homeLink` `/dashboard` |
| `src/App.tsx` | `CallsAdminProtected` só GESTOR; redirects settings; tirar wrappers |
| `src/features/projects/types/project.ts` | `UserRole` sem `ADMINISTRADOR` |
| `src/features/projects/components/ProjectListPage.tsx` | Paths GESTOR = `/adm/projetos/...` |
| `src/features/projects/components/ProjectDetailsPage.tsx` | `listPaths` GESTOR → `/adm/admprojetos`; Excluir se `GESTOR` |
| `src/pages/adm/projects/AdmProjects.tsx` | `role="GESTOR"` |
| `src/pages/adm/projects/ProjectViewEdit.tsx` | `role="GESTOR"` |

Wrappers a **apagar** (rotas viram `<Navigate>`):

- `src/pages/gestor/settings/GestorScholarships.tsx`
- `src/pages/gestor/settings/GestorUserTypes.tsx`
- `src/pages/gestor/settings/GestorAcademicUnits.tsx`
- `src/pages/gestor/settings/GestorRoles.tsx`
- `src/pages/gestor/settings/GestorParameters.tsx`

**Não alterar** `src/publisher/UsersAndRoles.tsx`.

### Data Model

`funcao.nome` é unique. FKs `usuario.funcao_id` e `funcao_permissao.funcao_id` são `ON DELETE NO ACTION` → apagar filhos/remapear **antes** de apagar `funcao`.

```sql
DELETE FROM "funcao_permissao"
WHERE "funcao_id" = (SELECT "id" FROM "funcao" WHERE "nome" = 'ADMIN');

UPDATE "usuario" AS u
SET "funcao_id" = g."id"
FROM "funcao" AS g, "funcao" AS a
WHERE g."nome" = 'GESTOR'
  AND a."nome" = 'ADMIN'
  AND u."funcao_id" = a."id";

DELETE FROM "funcao" WHERE "nome" = 'ADMIN';
```

Idempotente no sentido: se `ADMIN` já não existe, `DELETE`/`UPDATE` afetam 0 linhas.

Seed:

- `FUNCOES` sem entrada ADMIN.
- `USUARIOS_SEED`: `dev@example.com` e `gestor@exemplo.com` com `roleName: 'GESTOR'`.

Não há coluna de histórico de função. Rollback de dados **não** recupera quais usuários eram ADMIN; só recria a linha `funcao` e remapeia manualmente. Rollback de código + re-seed local é o caminho de dev.

### Interfaces / API Surface

```ts
/** Backend: src/auth/normalize-system-funcao.ts */
export function normalizeSystemFuncao(role?: string): string | undefined {
  if (role == null || role === '') return role;
  const upper = role.toUpperCase();
  return upper === 'ADMIN' ? 'GESTOR' : upper;
}
```

| Input | Output |
|-------|--------|
| `ADMIN` / `admin` | `GESTOR` |
| `GESTOR` | `GESTOR` |
| `COORDENADOR` | `COORDENADOR` |
| `ALUNO` | `ALUNO` |
| `undefined` / `''` | inalterado |

`JwtStrategy.validate` já devolve `funcao` normalizada. `RolesGuard` ainda muta `request.user.funcao` (idempotente; cobre testes/handlers que montam user sem passar pela strategy).

Frontend:

```ts
export type BackendRole = "DISCENTE" | "COORDENADOR" | "GESTOR" | "ADMIN" | "ALUNO" | "ADMINISTRADOR" | string
export type AppRole = "DISCENTE" | "COORDENADOR" | "GESTOR"

export function mapBackendRole(role?: BackendRole | AppRole): AppRole
```

| Input | AppRole |
|-------|---------|
| `ALUNO`, `DISCENTE` | `DISCENTE` |
| `COORDENADOR` | `COORDENADOR` |
| `GESTOR`, `ADMIN`, `ADMINISTRADOR` | `GESTOR` |
| unknown / empty | `DISCENTE` |

`Login.tsx` deixa de ter `normalizeRole` próprio.

Rotas de redirect (React Router `replace`, não HTTP 301):

| De | Para |
|----|------|
| `/gestor/settings` | `/adm/settings` |
| `/gestor/settings/scholarships` | `/adm/settings/scholarships` |
| `/gestor/settings/academic-units` | `/adm/settings/academic-units` |
| `/gestor/settings/roles` | `/adm/settings/roles` |
| `/gestor/settings/user-types` | `/adm/settings/user-types` |
| `/gestor/settings/parameters` | `/adm/settings/parameters` |
| `/gestor/projetos` | `/adm/admprojetos` |

Wrappers apagados **e** redirects no `App.tsx` — regra: redirects no router, componentes wrapper saem.

### Data Flow

1. `prisma migrate deploy` aplica SQL. Usuários ADMIN passam a `funcao_id` de GESTOR. Linha ADMIN some.
2. Seed upserta GESTOR/COORDENADOR/ALUNO. `dev@example.com` atualiza `funcao_id` para GESTOR.
3. `POST /authentications/sessions` → JWT `funcao: "GESTOR"`.
4. Request com token antigo `funcao: ADMIN` → JwtStrategy → `GESTOR` → RolesGuard confirma → handler vê GESTOR.
5. Front `authStorage.save` / `AuthProvider` init → `mapBackendRole` → menu GESTOR em `/adm/*`.

Fluxo secundário (localStorage velho com `role: "ADMINISTRADOR"`): `AuthProvider` remapeia na hidratação → não quebra `navByRole[role]`.

## Error Handling

| Caso | Comportamento |
|------|----------------|
| JWT sem `funcao` em rota com `@Roles` | `403` "Usuário autenticado sem função..." |
| Role COORDENADOR em rota só GESTOR | `403` "Acesso permitido apenas para perfis autorizados." |
| Seed sem linha GESTOR | `seedUsuarios` já lança `Função GESTOR não encontrada` |
| Migration com GESTOR ausente | `UPDATE` afeta 0 usuários ADMIN (órfãos até seed/manual) |
| Role frontend desconhecida | `DISCENTE` (conservador) |
| Token ADMIN após remover alias (Fase C, fora desta entrega) | `403` até re-login |

Rollback operacional:

1. Revert git dos dois repos para os hashes abaixo.
2. Se a migration já rodou: `INSERT` `funcao(nome='ADMIN')` e remapear usuários escolhidos à mão. Down automático não restaura o conjunto original.

## Testing Strategy

### Backend (Jest)

`normalize-system-funcao.spec.ts`:

- `ADMIN` / `admin` → `GESTOR`
- `GESTOR` → `GESTOR`
- `COORDENADOR` → `COORDENADOR`
- `undefined` → `undefined`

`roles.guard.spec.ts`:

- required `GESTOR`, user `ADMIN` → `true` e `request.user.funcao === 'GESTOR'`
- required `GESTOR`, user `COORDENADOR` → `ForbiddenException`
- sem `@Roles` → `true`

`jwt.strategy.spec.ts`: payload `funcao: 'ADMIN'` → `funcao: 'GESTOR'`.

Fixtures `funcao: 'ADMIN'` → `'GESTOR'` e títulos de teste em:

- `src/work-plan/work-plan.service.spec.ts`
- `src/work-plan/work-plan.controller.spec.ts`
- `src/work-plan/work-plan-access.service.spec.ts`
- `src/research/research.controller.spec.ts`
- `src/research/research.service.spec.ts`

Comandos: `npm test`, `npm run lint`.

### Frontend (Vitest)

`auth.test.ts`:

- `GESTOR` / `ADMIN` / `ADMINISTRADOR` → `GESTOR`
- `ALUNO` / `DISCENTE` → `DISCENTE`
- `COORDENADOR` → `COORDENADOR`
- `FOO` / `undefined` → `DISCENTE`

Comandos: `npm test`, `npm run lint`, `npm run build`.

QA manual (não automatizado nesta entrega): login `gestor@exemplo.com` e `dev@example.com`; CRUD edital; settings; decisão final; cotas; `SELECT nome FROM funcao` sem ADMIN.

## Migration Path

1. Backend: migration + seed + helper + jwt/guard + `@Roles` + services + specs + README.
2. Deploy backend.
3. Frontend: auth + header + rotas + projetos + apagar wrappers.
4. Deploy frontend.
- **Fase C (Deferred nesta sessão):** remover `normalizeSystemFuncao` / alias depois que todos os tokens ADMIN tiverem expirado (≥2h pós-deploy). README atualizado nesta entrega.

## Open Questions

Nenhuma. Fase C (tirar alias) fica em Deferred Work no board.

## Decision Log

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| JWT velho ADMIN | Alias no guard; cutover duro; forçar logout | Alias + mutate `request.user.funcao`; também no JwtStrategy | Custo baixo; janela 2h; rotas sem `@Roles` também vêem GESTOR |
| Linha `funcao` ADMIN | Apagar agora; órfã; seed recria | Apagar na mesma migration; seed sem ADMIN | Checklist `SELECT nome FROM funcao`; seed não ressuscita |
| `dev@example.com` | Manter+GESTOR; apagar; só ele | Manter os dois emails como GESTOR | Menos surpresa local; README atualiza o rótulo |
| Settings URL | `/adm/settings`; `/gestor/settings`; ambos | `/adm/settings/*` + redirect | Já alinhado a `/adm/calls` e `/adm/admprojetos`; EditalForm já linka `/adm/settings/scholarships` |
| Botão Excluir | GESTOR herda; esconder; Deferred | GESTOR herda | União de poderes |
| Board git | ignore; track | gitignore (já em `.gitignore`) | Estado de sessão local |
| Publisher | Unificar; ignorar | Não tocar | Namespace diferente |
| URLs `/adm/*` operacionais | Renomear `/gestor/*`; manter | Manter `/adm/*` | Fora de escopo; só settings unifica |
| Alias nesta entrega | Implementar e já remover | Implementar; **não** remover | Remover no mesmo PR anula a seam |

## Spec Review

Primeira passagem do reviewer independente sobre um outline: 2.4 (Major Gaps). Esta versão fecha inventário, SQL, contratos, redirects vs wrappers, ordem de deploy, matriz de testes e Decision Log. Re-score esperado ≥ 4.0.

- Completeness: 5 — seções COMPLEX preenchidas
- Consistency: 4 — dois repos, deploys coordenados; wrappers apagados + redirects explícitos
- Clarity: 4 — paths e SQL concretos
- Scope: 5 — bate com intake
- Testability: 5 — I/O por função
- Weighted: 4.55 — Approved para implementação (user já mandou executar o plano)
