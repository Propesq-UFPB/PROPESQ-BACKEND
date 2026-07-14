# PROPESQ Backend

API NestJS do **PROPESQ** — gestão acadêmica de editais, projetos de pesquisa, planos de trabalho, bolsas e fluxo de avaliação.

## O que a API cobre

| Área | Endpoints (base) |
|------|------------------|
| Autenticação (JWT) | `/authentications` |
| Usuários | `/users` |
| Projetos de pesquisa | `/research-projects` |
| Avaliação / notas | `/research-evaluation` |
| Distribuição de avaliadores | `/distribuicao` |
| Critérios de avaliação | `/evaluation-criteria` |
| Editais | `/editais` |
| Cotas de bolsa | `/cota-bolsa` |
| Bolsas | `/scholarships` |
| Categorias de edital | `/categories` |
| Unidades acadêmicas | `/academic-units` |
| Planos de trabalho | `/work-plans` |

Papéis: `ADMIN`, `GESTOR`, `COORDENADOR`, `ALUNO`. A maioria das rotas exige Bearer JWT; o Swagger documenta o esquema.

## Stack

- NestJS 11 + Prisma 6 + PostgreSQL 16
- Auth: Passport JWT
- Docs: Swagger em `/api`
- Docker Compose (Postgres em desenvolvimento)

## Pré-requisitos

- Node.js 22+
- Docker Desktop (com o daemon rodando)
- Arquivo `.env` na raiz (copie de `.env.example`)

## Subir o ambiente local

Postgres no Docker; a API roda no host.

```bash
# 1. Variáveis de ambiente
cp .env.example .env

# 2. Banco (porta host 5433 → 5432 no container)
docker compose -f docker-compose-dev.yml up -d postgres

# 3. Dependências
npm i

# 4. Schema + client
npx prisma migrate dev

# 5. Dados iniciais
npx prisma db seed

# 6. API (watch)
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

### Usuários do seed

| Perfil | E-mail | Senha |
|--------|--------|-------|
| ADMIN | `dev@example.com` | `changeme` |
| COORDENADOR | `coordenador@exemplo.com` | `senha123` |
| GESTOR | `gestor@exemplo.com` | `senha123` |
| ALUNO | `aluno@exemplo.com` | `senha123` |

Login via `POST /authentications/sessions` (vide Swagger).

## Scripts úteis

| Comando | Uso |
|---------|-----|
| `npm run start:dev` | API em modo watch |
| `npm run db:migrate:dev` | migrate + generate |
| `npm run db:migrate:deploy` | migrate em ambiente deploy |
| `npm run build` / `npm run start:prod` | build e produção |

## Observações

- O Compose também define serviços `backend` e `frontend`; o frontend aponta para `../PROPESQ-PROTOTIPO`. Para desenvolvimento da API, basta o serviço `postgres`.
- Se a porta `5433` já estiver em uso, pare o outro container ou altere o mapeamento no Compose e o `DATABASE_URL` no `.env`.
- Após reinstalar deps com npm recente (`allowScripts`), rode `npx prisma generate` se o client não tiver sido gerado.
