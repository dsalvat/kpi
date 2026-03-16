# PROMPT CONTRACT — Vibe Coding Session

> **Versió:** 1.0
> **Data:** 2026-03-16
> **Projecte:** Plataforma Web KPIs & OKRs · Departament IT
> **Autor:** David Salvat

---

## 1. Context del Projecte

**Què estem construint?**
Una plataforma web interna per al Departament IT que centralitza el seguiment de KPIs operatius,
projectes, OKRs i valor de negoci (Blue/Green Money). Substitueix l'Excel `KPIs_OKRs_IT_Sistemes.xlsx`
amb automatització via n8n i dashboards interactius.

**Estat actual:**
- [x] Projecte existent — afegir funcionalitat
- Fase 1 MVP + Fase 1.5 (Master Dades) + Fase 1.6 (Pressupost) + Fase 1.7 (Organització) completades
- Pròxim: Fase 2 (Connectors n8n) i Fase 3 (OKRs/Valor Negoci complets)

**Nivell d'acabat esperat:**
- [x] Demo presentable (funcional + UX bàsica) — evoluciona cap a producció

---

## 2. Tech Stack

### Frontend

| Peça | Rol / Detall |
|---|---|
| **React 18 + TypeScript** | SPA amb Vite, strict mode, path alias `@/*` |
| **Tailwind CSS** | Estils utilitaris amb CSS variables custom (design system) |
| **shadcn/ui** | Biblioteca de components — codi al projecte, customitzable |
| **Recharts** | Gràfics i visualitzacions |
| **Zustand** | Estat global (selectedYear, sidebar, selectedCompanyId) |
| **React Query (TanStack)** | Cache de dades del servidor, mutations, invalidació |
| **React Router** | Routing client-side |
| **Lucide React** | Icones |

### Backend

| Peça | Rol / Detall |
|---|---|
| **Python 3.12 + FastAPI** | Framework async, OpenAPI docs a `/docs` |
| **Pydantic v2** | Validació de dades i schemas |
| **SQLAlchemy 2.0 async** | ORM amb asyncpg. **selectinload obligatori** per relacions |
| **Alembic** | Migracions de BD (async amb asyncpg) |
| **pytest + pytest-asyncio** | Tests amb mode auto |

### Infraestructura

| Peça | Rol / Detall |
|---|---|
| **PostgreSQL 16** | BD principal (Docker) |
| **Redis 7** | Cache dashboard (graceful degradation si absent) |
| **Nginx** | Reverse proxy: `/` → frontend, `/api/` → backend |
| **Docker Compose** | 5 serveis: postgres, redis, backend, frontend, nginx |
| **n8n** | Workflows de col·lecció de dades (via MCP) |

> **Regla:** No introdueixis llibreries o dependències noves sense consultar-me primer.

---

## 3. Arquitectura i Estructura

### Convencions de naming

| Element | Convenció | Exemple |
|---|---|---|
| Fitxers TS/React | `PascalCase` (components), `camelCase` (hooks/utils) | `KPICard.tsx`, `useKPIs.ts` |
| Fitxers Python | `snake_case` | `kpi_service.py` |
| Variables JS/TS | `camelCase` | `selectedYear` |
| Variables Python | `snake_case` | `company_id` |
| Constants | `UPPER_SNAKE_CASE` | `ROLE_CONFIG` |
| Components React | `PascalCase` | `StatusBadge` |
| BD (taules/columnes) | `snake_case` | `kpi_definitions`, `company_id` |
| API endpoints | `/api/v1/recurs/` (amb trailing slash) | `/api/v1/organization/companies/` |
| Codis KPI | `[GRUP]-[NUM]` | `SRV-01`, `PRJ-M02` |
| Codis OKR | `O[n].KR[n]` | `O1.KR1` |
| Idioma UI | **Català** | Labels, títols, textos |
| Idioma codi | **Anglès** | Variables, funcions, commits |

---

## 4. Regles de Codi

### Estil i qualitat
- [x] TypeScript estricte (`strict: true`) — sense `any`, tipus explícits
- [x] Python: ruff amb line-length 100, target Python 3.12
- [x] Funcions petites (màx. ~30 línies)
- [x] Un component per fitxer
- [x] Comentaris només quan el "per què" no és obvi
- [x] Noms descriptius > comentaris

### Gestió d'errors
- [x] Try-catch en tota operació async/externa
- [x] Missatges d'error descriptius per a l'usuari (en català)
- [x] Loading states (skeleton/spinner) per cada crida API
- [x] Mai fallar silenciosament
- [x] Redis graceful degradation (funciona sense cache)

### Seguretat
- [x] Variables d'entorn per a secrets (`.env`)
- [x] Validació d'inputs al servidor (Pydantic)
- [x] Tokens emmascarats a l'API (`****xxxx`)
- [x] CORS configurat (FastAPI)
- [x] JWT auth (hardcoded al MVP, SSO futur)

### SQLAlchemy async (important!)
- [x] **selectinload obligatori** per tota relació que es serialitzi — lazy loading falla amb `MissingGreenlet`
- [x] Après commit, reload amb `select().options(selectinload(...))` — mai simple `refresh()`
- [x] Seed script usa sync SQLAlchemy (psycopg2), no async

---

## 5. Regles de Comunicació

### Abans d'escriure codi
1. **Confirma la comprensió** — Repeteix en 2-3 frases què faràs abans de començar.
2. **Si hi ha ambigüitat, pregunta** — No assumeixis. Millor una pregunta que refer feina.
3. **Proposa abans d'implementar** — Si hi ha diverses formes, presenta les opcions amb pros/contres.

### Al escriure codi
4. **Canvis incrementals** — No reescriguis fitxers sencers si només cal canviar una part.
5. **Un pas a la vegada** — Si la tasca és gran, divideix-la i demana confirmació entre passos.
6. **Codi complet i funcional** — Sense `// ... resta del codi`. Tot ha de ser copy-paste-ready.
7. **Indica on va cada cosa** — Sempre inclou el path del fitxer.

### Després d'escriure codi
8. **Resum de canvis** — Llista breument quins fitxers has tocat i què ha canviat.
9. **Pròxims passos** — Suggereix què fer després o què queda pendent.
10. **Assenyala riscos** — Si alguna cosa pot fallar o hi ha deute tècnic, digues-ho proactivament.

---

## 6. Anti-patrons — El que NO vull

### Codi
- No inventis dades d'exemple que semblin reals (emails, noms de persones reals, etc.)
- No eliminis funcionalitat existent en afegir-ne de nova
- No canviïs el stack tecnològic sense consultar-me
- No facis servir patrons over-engineered per a problemes simples (YAGNI!)
- No ignoris els errors de TypeScript / ruff
- No facis múltiples canvis no relacionats en la mateixa resposta
- No assumeixis que un servei extern està configurat — pregunta
- No introdueixis una nova dependència sense proposar-la primer

### UI (veure també CLAUDE.md secció 3.6)
- Taules sense paginació per a llistes > 20 files
- Gràfics sense etiquetes als eixos
- Semàfor basat únicament en color (cal icona + text)
- Loading states absents
- Formularis sense validació inline
- `outline: none` — trenca accessibilitat de teclat
- Animacions sense `prefers-reduced-motion`

---

## 7. Testing

**Estratègia:**
- [x] TDD estricte per lògica de negoci (`calculations.py`)
- [x] Tests unitaris bàsics per endpoints
- [ ] Tests E2E (futur)
- [ ] Tests frontend (futur)

**Frameworks:**

| Àmbit | Framework |
|---|---|
| Backend | pytest + pytest-asyncio (mode auto) |
| Lògica negoci | 40 tests a `test_calculations.py` |
| Frontend (futur) | Vitest + Testing Library |
| E2E (futur) | Playwright |

---

## 8. Flux de Treball per Iteració

```
┌─────────────────────────────────────────────┐
│  1. Jo descrisc el que necessito             │
│     ↓                                        │
│  2. Tu confirmes comprensió + proposes pla   │
│     ↓                                        │
│  3. Jo aprovo o corregeixo el pla            │
│     ↓                                        │
│  4. Tu implementes pas a pas                 │
│     ↓                                        │
│  5. Jo provo i dono feedback                 │
│     ↓                                        │
│  6. Iterem fins que funcioni ✅               │
└─────────────────────────────────────────────┘
```

**Paraules clau de comunicació ràpida:**

| Paraula | Significat |
|---|---|
| **SGTM** | Sounds Good To Me — procedeix tal com has dit |
| **PLAN** | Només vull veure el teu pla, no escriguis codi encara |
| **YOLO** | Implementa directament sense demanar confirmació |
| **STOP** | Para, necessito repensar alguna cosa |
| **RECAP** | Dóna'm un resum de l'estat actual del projecte |
| **UNDO** | Desfés l'últim canvi |

---

## 9. Checklist d'Inici de Sessió

Quan comencis una nova sessió de Vibe Coding:

- [ ] Llegeix CLAUDE.md (font de veritat del projecte)
- [ ] Llegeix PROMPT_CONTRACT.md (regles de col·laboració)
- [ ] Revisa l'estat actual (`git log --oneline -10`, Docker status)
- [ ] Confirma quina tasca abordarem
- [ ] Si no tens context suficient, pregunta abans de generar codi

---

> **Nota sobre Vibe Coding:**
> El Vibe Coding no és "deixar que la IA faci el que vulgui". És una **col·laboració estructurada**
> on l'humà aporta la visió, les decisions de negoci i el criteri, i la IA aporta velocitat
> d'execució, coneixement tècnic i consistència. Aquest contracte existeix perquè aquesta
> col·laboració sigui **predecible, eficient i de qualitat**.

---

*Última actualització: 2026-03-16*
