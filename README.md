# Plataforma KPIs & OKRs — Departament IT

Plataforma web interna per al seguiment de KPIs operatius, projectes IT, OKRs trimestrals i aportació de valor al negoci (Blue Money / Green Money). Substitueix el fitxer Excel `KPIs_OKRs_IT_Sistemes.xlsx`.

## Stack Tecnologic

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Components | shadcn/ui + Recharts |
| Backend | Python 3.12 + FastAPI (async) |
| Base de dades | PostgreSQL 16 |
| Cache | Redis 7 |
| Connectors externs | n8n (workflows visuals) |
| Infraestructura | Docker Compose + Nginx |

## Requisits previs

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20+)
- Git

## Inici rapid

```bash
# 1. Clonar el repositori
git clone <url-repo> kpi-platform
cd kpi-platform

# 2. Copiar variables d'entorn
cp .env.example .env

# 3. Arrancar tots els serveis
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# 4. Esperar que postgres i redis estiguin healthy
docker compose ps

# 5. Generar i aplicar migracions
docker compose exec backend alembic revision --autogenerate -m "initial_tables"
docker compose exec backend alembic upgrade head

# 6. Seedejar dades des de l'Excel (copiar l'xlsx al directori arrel primer)
# En Git Bash (Windows) cal MSYS_NO_PATHCONV=1
MSYS_NO_PATHCONV=1 docker compose exec backend python -m scripts.seed_from_excel /data/KPIs_OKRs_IT_Sistemes.xlsx
```

## URLs de Servei

| Servei | URL | Descripcio |
|--------|-----|-----------|
| Aplicacio (Nginx) | http://localhost | Frontend + API via reverse proxy |
| Frontend (Vite dev) | http://localhost:5173 | Hot reload directe |
| Backend (FastAPI) | http://localhost:8000 | API directa |
| API Docs (Swagger) | http://localhost:8000/docs | Documentacio interactiva |
| PostgreSQL | localhost:5432 | `kpi_user` / `password` / `kpi_db` |
| Redis | localhost:6379 | Cache dashboard |

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React 18)                 │
│  Dashboard · KPIs · Projectes · OKRs · Valor Negoci │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                  BACKEND (FastAPI)                    │
│  Auth · KPI Service · OKR Service · Ingest (n8n)    │
└──────┬──────────────────────────────────────────────┘
       │
┌──────▼──────┐  ┌──────────┐  ┌─────────────────┐
│ PostgreSQL  │  │  Redis   │  │  n8n Workflows  │
│  (dades)    │  │ (cache)  │  │ (connectors IT) │
└─────────────┘  └──────────┘  └────────┬────────┘
                                        │
              ┌─────────────────────────▼────────┐
              │  SAP · Meraki · Aruba · ITSM     │
              └──────────────────────────────────┘
```

## Estructura del Projecte

```
kpi/
├── claude.md                    # Especificacio completa del projecte
├── docker-compose.yml           # Serveis de produccio
├── docker-compose.dev.yml       # Overrides de desenvolupament
├── .env.example                 # Variables d'entorn
├── .mcp.json                    # Configuracio MCP (n8n)
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic/                 # Migracions de base de dades
│   ├── scripts/
│   │   └── seed_from_excel.py   # Importacio dades Excel
│   ├── app/
│   │   ├── main.py              # Entrada FastAPI
│   │   ├── auth.py              # JWT + autenticacio
│   │   ├── cache.py             # Wrapper Redis (graceful degradation)
│   │   ├── config.py            # Pydantic Settings
│   │   ├── database.py          # SQLAlchemy async
│   │   ├── models/              # ORM: kpi, project, okr, value, sync_log
│   │   ├── schemas/             # Pydantic v2 (request/response)
│   │   ├── routers/             # 7 routers: auth, kpis, projects, okrs, value, ingest, dashboard
│   │   └── services/
│   │       ├── calculations.py  # Logica de negoci (DRY source of truth)
│   │       ├── kpi_service.py
│   │       ├── project_service.py
│   │       ├── okr_service.py
│   │       ├── value_service.py
│   │       ├── ingest_service.py
│   │       └── dashboard_service.py
│   └── tests/
│       ├── test_calculations.py # 40 tests (TDD)
│       └── test_health.py
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── api/client.ts        # Axios + JWT interceptor
│   │   ├── store/index.ts       # Zustand (any seleccionat, sidebar)
│   │   ├── hooks/               # React Query hooks
│   │   ├── types/               # TypeScript interfaces
│   │   ├── styles/
│   │   │   ├── globals.css      # CSS custom properties (design system)
│   │   │   └── tokens.ts        # Design tokens per Recharts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Vista principal
│   │   │   ├── KPIsServeis.tsx  # KPIs amb entrada manual
│   │   │   ├── KPIsProjectes.tsx
│   │   │   ├── OKRs.tsx
│   │   │   └── ValorNegoci.tsx
│   │   └── components/
│   │       ├── layout/          # AppLayout, Sidebar, Header
│   │       ├── kpis/            # KPICard, KPIValueForm
│   │       ├── okrs/            # KRProgressBar
│   │       ├── value/           # MoneyCard
│   │       └── shared/          # StatusBadge, SkeletonCard, EmptyState, ErrorBoundary
│   └── tests/
│
└── nginx/nginx.conf             # Reverse proxy config
```

## API Endpoints

```
POST  /api/v1/auth/login             # JWT login (admin/admin123, viewer/viewer123)
GET   /api/v1/auth/me                # Usuari actual

GET   /api/v1/dashboard/?year=2025   # Resum executiu complet
GET   /api/v1/dashboard/year/{year}  # Dashboard per any

GET   /api/v1/kpis/                  # Llista KPIs amb estat actual
GET   /api/v1/kpis/{code}/values/    # Valors mensuals
POST  /api/v1/kpis/{code}/values/    # Entrada manual
GET   /api/v1/kpis/{code}/status/    # Semafor actual

POST  /api/v1/ingest/kpi-value       # Webhook n8n (auth: N8N_WEBHOOK_TOKEN)
POST  /api/v1/ingest/batch           # Multiples valors
GET   /api/v1/ingest/logs/           # Historial sync n8n

GET   /api/v1/projects/              # Llista projectes
PUT   /api/v1/projects/{code}        # Actualitzar projecte

GET   /api/v1/okrs/?year=2025        # Objectius + KRs
PUT   /api/v1/okrs/quarterly/{id}    # Actualitzar dada trimestral

GET   /api/v1/value/?year=2025       # Blue + Green Money
GET   /api/v1/value/roi/             # ROI global
```

## Dades de l'Excel

El seed script (`backend/scripts/seed_from_excel.py`) importa totes les dades de `KPIs_OKRs_IT_Sistemes.xlsx`:

| Pestanya | Dades | Registres |
|----------|-------|-----------|
| KPIs Serveis | 12 KPIs (SRV-01..SRV-12) + 12 mesos | 144 valors |
| KPIs Projectes | 8 projectes + 8 KPIs mensuals (PRJ-M01..M08) | 8 + 96 valors |
| Valor Negoci | 8 Blue Money (BM-01..08) + 5 Green Money (GM-01..05) | 13 items |
| OKRs | 5 objectius + 20 Key Results + dades Q1-Q4 | 80 quarters |

**Totals verificats:**
- Blue Money: 233.650 EUR
- Green Money: 400.600 EUR

## Tests

```bash
# Backend (dins Docker)
docker compose exec backend python -m pytest tests/ -v

# 40 tests de calculations.py (logica de negoci critica)
# 1 test de health endpoint
```

## Comandes utils

```bash
# Logs en temps real
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Logs d'un servei concret
docker compose logs backend --tail 50

# Aturar tot
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Aturar i esborrar volums (PERDRA DADES)
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Re-seedejar dades
MSYS_NO_PATHCONV=1 docker compose exec backend python -m scripts.seed_from_excel /data/KPIs_OKRs_IT_Sistemes.xlsx

# Shell dins el backend
docker compose exec backend bash

# Consola PostgreSQL
docker compose exec postgres psql -U kpi_user -d kpi_db
```

## Fases d'Implementacio

- [x] **Fase 1 — MVP**: Docker + DB + API + Frontend + Seed Excel
- [ ] **Fase 2 — Connectors n8n**: Workflows ITSM, Meraki, Aruba, SAP
- [ ] **Fase 3 — OKRs i Valor**: Pagines completes OKRs, Blue/Green Money, retrospectives
- [ ] **Fase 4 — Poliment**: Export PDF, WebSocket, alertes automatiques

## Autenticacio (MVP)

Usuaris hardcoded per al MVP:

| Usuari | Password | Rol |
|--------|----------|-----|
| `admin` | `admin123` | Administrador |
| `viewer` | `viewer123` | Consulta |

> Fase posterior: integrar Active Directory / SSO.

## Configuracio n8n

El servidor n8n esta configurat via MCP a `.mcp.json`. Els workflows envien dades al backend via `POST /api/v1/ingest/kpi-value` autenticats amb `N8N_WEBHOOK_TOKEN`.
