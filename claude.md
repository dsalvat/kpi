# CLAUDE.md — Plataforma Web KPIs & OKRs · Departament IT

> Font de veritat per a Claude Code. Llegeix-lo sencer abans de qualsevol canvi.
> Actualitza'l quan canviï l'arquitectura, les decisions de disseny o les prioritats.

---

## 0. Plugins Obligatoris i Workflow de Sessió

Aquests plugins han d'estar instal·lats **abans d'iniciar qualsevol sessió de treball**.
No són opcionals — defineixen com Claude Code treballa en aquest projecte.

### 0.1 Instal·lació (una sola vegada)

```bash
# 1. Superpowers — metodologia TDD + planificació + subagents (obra/superpowers)
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace

# 2. UI/UX Pro Max — intel·ligència de disseny (nextlevelbuilder/ui-ux-pro-max-skill)
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# 3. claude-mem — memòria persistent entre sessions (thedotmack/claude-mem)
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem

# 4. n8n Skills — construcció de workflows n8n (czlonkowski/n8n-skills)
/plugin marketplace add czlonkowski/n8n-skills
/plugin install n8n-mcp-skills

# 5. Obsidian Skills — documentació Markdown estructurada (kepano/obsidian-skills)
/plugin marketplace add kepano/obsidian-skills
/plugin install obsidian@obsidian-skills

# Reiniciar Claude Code. Tots els skills s'activen automàticament per context.
```

> Consulta `hesreallyhim/awesome-claude-code` per descobrir plugins addicionals
> útils a mesura que el projecte creixi.

### 0.2 Skills de Disseny Frontend

El skill **frontend-design** esta actiu i s'invoca automaticament quan es demana
construir components, pagines o interficies web. Genera codi de produccio amb alt
nivell de disseny, evitant estetica generica "AI slop".

**Quan s'activa**: Sempre que es construeixi un component UI nou o es redissenyi un existent.

**Principis clau del skill**:
- **Tipografia**: Fonts distintives, mai generiques (evitar Arial, Inter per defecte)
- **Color**: Paleta cohesiva amb accents forts. CSS variables per consistencia.
- **Animacions**: Prioritzar CSS-only. Motion library per React quan disponible.
- **Composicio**: Layouts amb intencio — asimetria, espai negatiu, grid-breaking.
- **Fons i detalls**: Atmosfera i profunditat, no colors solids plans.

**Invocacio manual**: `/frontend-design` o Skill tool amb `skill: "frontend-design"`.

### 0.3 Pipeline de Treball Obligatori (Superpowers)

Superpowers imposa un workflow estructurat. Si hi ha un 1% de probabilitat que un
skill apliqui, s'ha d'invocar. Les fases son **obligatories, no suggeriments**.

```
┌──────────────────────────────────────────────────────────────────┐
│  FASE 1 · BRAINSTORM   Explorar requisits abans d'escriure codi  │
│           /superpowers:brainstorming                             │
│                                                                  │
│  FASE 2 · PLANIFICAR   Pla clar, tasques de 2-5 min cadascuna   │
│           Git worktree per a cada feature independent            │
│                                                                  │
│  FASE 3 · IMPLEMENTAR  Un subagent per tasca, TDD obligatori     │
│           /superpowers:subagent-driven-development               │
│                                                                  │
│  FASE 4 · TDD          RED → GREEN → REFACTOR. Sense excepcions │
│           /superpowers:test-driven-development                   │
│                                                                  │
│  FASE 5 · CODE REVIEW  Entre tasques. Bloqueig si crítica        │
│           /superpowers:requesting-code-review                    │
│                                                                  │
│  FASE 6 · TANCAR       Verificar tests, merge/PR, netejar        │
│           /superpowers:finishing-a-development-branch            │
└──────────────────────────────────────────────────────────────────┘
```

**Quatre principis que Superpowers imposa en aquest projecte:**
- **TDD estricte**: Test que falla → mínim codi → passa → refactoritza → commit. Mai al revés.
- **YAGNI**: No implementis res que no estigui a la fase actual. Les properes fases ja vindran.
- **DRY**: Cada lògica de negoci (càlcul progrés, semàfor, Blue/Green Money) existeix en UN sol lloc.
- **Debugging sistemàtic**: 4 fases — Diagnosticar → Patrons → Hipòtesis → Implementar. Mai "provar coses a l'atzar". Si falles 3 vegades: parada obligatòria i revisió d'arquitectura.

### 0.4 Memoria entre Sessions (claude-mem)

claude-mem captura automàticament les decisions de cada sessió i les injecta a la
propera. No cal fer res especial. Si cal recuperar context:

```bash
# Via MCP tools de claude-mem — cerca en historial de sessions anteriors
search(query="decisió arquitectura connectors n8n", type="architecture", limit=10)
search(query="design system dashboard colors", type="ui", limit=5)
search(query="càlcul Blue Money fórmula", type="implementation", limit=5)
```

### 0.5 Documentacio Tecnica (obsidian-skills)

Tota la documentació tècnica del projecte (ADRs, guies, retrospectives) s'escriu en
Markdown estructurat seguint les convencions d'Obsidian Skills:
- WikiLinks entre documents: `[[CLAUDE]]`, `[[design-system/MASTER]]`
- Frontmatter YAML en tots els documents
- Canvas JSON per a diagrames d'arquitectura visuals (`docs/arquitectura.canvas`)

---

## 1. Visió del Projecte

**Què estem construint?**
Una plataforma web interna per al Departament IT (Equip de Sistemes) que:
1. **Centralitza** el seguiment de KPIs operatius i KPIs de projectes
2. **Automatitza** la recuperació de dades des dels sistemes corporatius (SAP, Meraki, Aruba, ITSM)
3. **Visualitza** l'aportació de valor al negoci (Blue Money i Green Money)
4. **Gestiona** el cicle d'OKRs trimestrals vinculant-los automàticament als KPIs
5. **Substitueix** el fitxer Excel `KPIs_OKRs_IT_Sistemes.xlsx` existent

**Per a qui?**
- **Usuari primari**: Tècnics i Responsable Equip de Sistemes IT (entrada de dades + consulta diària)
- **Usuari secundari**: Director IT (dashboards + OKRs + informes)
- **Audiència ocasional**: Direcció General (informe executiu trimestral de valor al negoci)

**Principi de disseny fonamental:**
> "Si actualitzes un valor a la font (SAP, Meraki, tiquet ITSM…), el dashboard
> ha de reflectir-ho automàticament sense cap acció manual."

---

## 2. Arquitectura

### Decisió clau: n8n substitueix Celery

En lloc de workers Python amb Celery, **tots els connectors externs s'implementen
com a workflows n8n**. Avantatges: interfície visual per debugar, menys codi de
manteniment, servidor n8n ja disponible i configurat via MCP.

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                   │
│  Dashboard · KPIs · Projectes · OKRs · Valor Negoci     │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│  Auth · KPI Service · OKR Service · Ingest (n8n)        │
└──────┬─────────────────────────────────────────────────-┘
       │
┌──────▼──────┐  ┌──────────────┐  ┌─────────────────────┐
│ PostgreSQL  │  │    Redis     │  │  n8n Workflows      │
│  (dades)   │  │   (cache)    │  │  (connectors IT)    │
└─────────────┘  └──────────────┘  └──────────┬──────────┘
                                              │ API Calls
              ┌────────────────────────────── ▼──────────┐
              │  SAP · Meraki · HPE Aruba · ITSM         │
              └──────────────────────────────────────────-┘
```

### Stack Tecnològic

| Capa | Tecnologia | Raó |
|------|-----------|-----|
| Frontend | React 18 + TypeScript | Compatible shadcn/ui + ui-ux-pro-max |
| UI Components | shadcn/ui + Tailwind CSS | Sistema de components accessible |
| Gràfics | Recharts | Lleuger, declaratiu, compatible React |
| Backend | Python 3.12 + FastAPI | Async, tipat, SDKs SAP/Meraki disponibles |
| Base de dades | PostgreSQL 16 | Relacional + JSONB per configs |
| Cache | Redis 7 | Cache API + sessions WebSocket |
| Connectors | **n8n** (no Celery) | Visual, debuggable, MCP disponible |
| Containerització | Docker Compose | Desplegament consistent |
| Reverse proxy | Nginx | Serveix frontend + proxeja API |

---

## 3. Sistema de Disseny UI/UX (ui-ux-pro-max)

> **REGLA:** Sense sistema de disseny, no s'escriu cap component.
> El `design-system/MASTER.md` té prioritat absoluta sobre qualsevol decisió visual.

### 3.1 Generar el Sistema de Disseny (primera acció obligatòria)

```bash
# PAS 1 — Generar i persistir el sistema de disseny del projecte
python3 skills/ui-ux-pro-max/scripts/search.py \
  "internal IT operations analytics dashboard corporate professional data" \
  --design-system --persist -p "KPI Platform IT"

# PAS 2 — Llegir el resultat generat
cat design-system/MASTER.md

# PAS 3 — Pautes específiques per a dashboards de dades
python3 skills/ui-ux-pro-max/scripts/search.py \
  "dashboard analytics KPI metrics" --domain chart --stack shadcn

# PAS 4 — Tipografia per a interfícies de dades numèriques
python3 skills/ui-ux-pro-max/scripts/search.py \
  "data table numbers metrics readability" --domain typography --stack react

# PAS 5 — UX per a formularis d'entrada de KPIs
python3 skills/ui-ux-pro-max/scripts/search.py \
  "form input data entry validation" --domain ux --stack shadcn
```

**Abans de construir cada pàgina nova, generar les regles específiques:**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py \
  "internal IT dashboard [nom-pàgina]" \
  --design-system --persist -p "KPI Platform IT" --page "[nom-pàgina]"

# Llegir regles de la pàgina (prioritat) o MASTER si no existeix
cat design-system/pages/[nom-pàgina].md || cat design-system/MASTER.md
```

### 3.2 Paleta de Colors del Projecte

Derivada dels colors corporatius de l'Excel original. **No modificar sense actualitzar MASTER.md.**

```css
/* frontend/src/styles/globals.css */
:root {
  /* Principals */
  --color-primary:       #1F3864;  /* Blau fosc — nav, headers */
  --color-secondary:     #2E75B6;  /* Blau mig — KPIs Serveis, accions */
  --color-success:       #1E8449;  /* Verd — Green Money, estat OK */
  --color-blue-money:    #1A5276;  /* Blau profund — Blue Money */
  --color-warning:       #F39C12;  /* Taronja — alertes, ROI, warnings */
  --color-danger:        #C0392B;  /* Vermell — KO, fora de target */
  --color-okr:           #6C3483;  /* Lila — OKRs */

  /* Fons */
  --color-bg:            #F4F6F9;  /* Fons de pàgina */
  --color-surface:       #FFFFFF;  /* Cards i panells */
  --color-border:        #E2E8F0;  /* Vores subtils */

  /* Semàfor (sempre amb text/icona acompanyant, mai sol) */
  --status-ok:           #27AE60;
  --status-warning:      #F39C12;
  --status-ko:           #C0392B;
  --status-nodata:       #95A5A6;
}
```

### 3.3 Tipografia

```
Títols i xifres grans: Inter o Plus Jakarta Sans — 600-700 weight
Dades numèriques (KPIs, €, %): JetBrains Mono o Roboto Mono (llegibilitat de números)
Cos de text: Inter Regular 400
Mida mínima: 14px (accessibilitat)
```

### 3.4 Regles d'Accessibilitat (no negociables)

Extrets de les `ui-ux-pro-max` UX guidelines:

- Contrast mínim **4.5:1** per a text normal, **3:1** per a text gran
- **Focus rings** visibles en tots els elements interactius (no `outline: none` mai)
- **Alt text** descriptiu per a totes les icones significatives
- **`aria-label`** en tots els botons d'icona sense text visible
- **Navegació per teclat completa** — Tab order igual que l'ordre visual
- **Semàfor doble**: mai únicament color — sempre afegir icona o text (✅⚠️❌)
- **`prefers-reduced-motion`**: respectar en totes les animacions

### 3.5 Components UI Crítics

**`<KPICard />`** — El component més usat de tot el projecte:

```
┌──────────────────────────────────────┐
│ SRV-01  SLA Global          ✅ OK    │  ← Codi + nom + semàfor (icona + text)
│                                      │
│         96.5%               ↑        │  ← Valor gran (mono font) + tendència
│         Target: 95%                  │
│ ████████████░░░  96%                │  ← Barra progrés + percentatge
│                                      │
│ Meraki · Actualitzat: fa 2h          │  ← Font + timestamp (si auto)
└──────────────────────────────────────┘
```

**`<KRProgressBar />`** — Per a cada Key Result als OKRs:

```
O1.KR1  Assolir SLA global ≥ 97%              [🟢 Alta confiança]
Q1: 96%→96.5% ✓   Q2: 96.5%→97.2% ✓   Q3: 97%→ —   Q4: 97.5%→ —
████████████████████░░░░░░░  78% progrés anual
```

**`<MoneyCard />`** — Blue Money i Green Money:

```
┌─────────────────────┐  ┌─────────────────────┐
│  💰 Blue Money      │  │  📈 Green Money      │
│  Eficiència IT      │  │  Valor al Negoci     │
│                     │  │                      │
│  €47.200            │  │  €46.000             │
│  de €90.000         │  │  de €400.000         │
│  ████░░░░░  52%     │  │  ██░░░░░░░  12%      │
└─────────────────────┘  └─────────────────────┘
```

**`<StatusBadge />`** — Semàfor accessible (mai únicament color):

```tsx
// Sempre icona + text + color. Mai només color.
<StatusBadge status="ok" />      → 🟢 <span>OK</span>
<StatusBadge status="warning" /> → 🟡 <span>Alerta</span>
<StatusBadge status="ko" />      → 🔴 <span>KO</span>
<StatusBadge status="no_data" /> → ⚪ <span>Sense dades</span>
```

### 3.6 Anti-patrons a Evitar

Extrets de les UX guidelines d'ui-ux-pro-max:

- ❌ Taules sense paginació per a llistes > 20 files
- ❌ Gràfics sense etiquetes als eixos X i Y
- ❌ Semàfor basat únicament en color (sense icona ni text)
- ❌ Loading states absents — cada crida API necessita skeleton o spinner
- ❌ Formularis sense validació inline (errors han d'aparèixer mentre s'escriu)
- ❌ Z-index caòtic — definir escala: modal 1000 / tooltip 500 / nav 100 / base 1
- ❌ Dades numèriques sense context de target o de període temporal
- ❌ `outline: none` en elements amb focus — trenca accessibilitat de teclat
- ❌ Animacions sense `prefers-reduced-motion`

### 3.7 Gràfics per Pàgina

Consultar ui-ux-pro-max per a cada cas:
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "[tipus de dada]" --domain chart --stack shadcn
```

| Pàgina | Gràfic | Component Recharts |
|--------|--------|--------------------|
| Dashboard — overview KPIs | Sparklines | `AreaChart` miniatura |
| KPIs Serveis — SLA/Disponibilitat | Línies multi-sèrie | `LineChart` |
| KPIs Serveis — MTTR | Barres mensuals | `BarChart` |
| KPIs Serveis — CSAT | Línia + target horitzontal | `LineChart` + `ReferenceLine` |
| KPIs Projectes — distribució estat | Donut | `PieChart` |
| KPIs Projectes — ROI per projecte | Barres horiz. | `BarChart` layout="vertical" |
| Valor Negoci — Blue vs Green | Barres agrupades | `BarChart` grouped |
| OKRs — progrés per objectiu | Radial | `RadialBarChart` |
| OKRs — KR per quarter | Barres apilades | `BarChart` stacked |

---

## 4. Connectors via n8n (czlonkowski/n8n-mcp)

Els connectors no s'implementen com a codi Python — s'implementen com a **workflows n8n**.
El servidor n8n ja és accessible via MCP.

### 4.1 Configuració MCP (`.mcp.json`)

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "N8N_API_URL": "https://n8n-n8n.rowjve.easypanel.host",
        "N8N_API_KEY": "${N8N_API_KEY}"
      }
    }
  }
}
```

### 4.2 Workflows n8n a Crear

| Workflow | Schedule | KPIs col·lectats | Sistema origen |
|----------|----------|------------------|----------------|
| `collect-meraki-monthly` | 1r dia mes, 06:00 | SRV-01, SRV-02 (oficines) | Meraki API |
| `collect-aruba-monthly` | 1r dia mes, 06:30 | SRV-02 (factories) | HPE Aruba Central |
| `collect-itsm-monthly` | 1r dia mes, 07:00 | SRV-03..08, SRV-11, SRV-12 | ServiceNow / Jira / Fresh |
| `collect-sap-monthly` | 1r dia mes, 07:30 | Costos IT, desviació pressupost | SAP OData |
| `alert-kpi-threshold` | Webhook en temps real | Qualsevol KPI | Rebut de qualsevol col·lecta |

**Patró de workflow (exemple Meraki):**
```
[Schedule Trigger: 1r dia mes]
    ↓
[HTTP Request → Meraki API: getOrganizationUplinksStatuses]
    ↓
[Code Node: calcular uptime% mensual per xarxa]
    ↓
[HTTP Request → FastAPI POST /api/v1/ingest/kpi-value]
    ↓ (si SLA < threshold)
[Send Notification: Slack/email]
```

### 4.3 Com Construir Workflows amb Claude Code

Amb n8n-skills actiu, els skills s'activen automàticament per context:

```
Si escrius expressions {{}} syntax     → n8n-expression-syntax activa
Si busques nodes                       → n8n-mcp-tools-expert activa (search_nodes)
Si connectes nodes en un patró        → n8n-workflow-patterns activa (5 patrons)
Si hi ha errors de validació           → n8n-validation-expert activa i guia la correcció
Si escrius codi JavaScript a un node  → n8n-code-javascript activa
Si escrius codi Python a un node      → n8n-code-python activa
```

### 4.4 FastAPI rep dades via Ingest Endpoint

Els workflows n8n envien dades a FastAPI. La FastAPI **no consulta** sistemes externs.

```python
# backend/app/routers/ingest.py
@router.post("/ingest/kpi-value", dependencies=[Depends(verify_n8n_token)])
async def ingest_kpi_value(payload: KPIIngestPayload, db: AsyncSession = Depends(get_db)):
    """Cridat pels workflows n8n. Valida, guarda i invalida cache del dashboard."""
    ...

@router.post("/ingest/batch")
async def ingest_batch(payloads: list[KPIIngestPayload], ...):
    """Múltiples valors en una sola crida (eficiència)."""
    ...
```

---

## 5. Estructura de Directoris (Estat Actual)

```
kpi/
├── claude.md                       ← Font de veritat (aquest fitxer)
├── README.md                       ← Documentacio del projecte
├── docker-compose.yml              ← Serveis de produccio
├── docker-compose.dev.yml          ← Overrides de desenvolupament
├── .env.example                    ← Variables d'entorn plantilla
├── .mcp.json                       ← Config MCP (n8n-mcp)
├── .gitignore
├── KPIs_OKRs_IT_Sistemes.xlsx      ← Fitxer Excel original (dades seed)
│
├── backend/
│   ├── Dockerfile                  ← Multi-stage: base (prod) + dev (amb hot reload)
│   ├── .dockerignore
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py                  ← Alembic async amb asyncpg
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 8adb4d20fb77_initial_tables.py
│   ├── scripts/
│   │   └── seed_from_excel.py      ← Importacio dades Excel (sync, psycopg2)
│   ├── app/
│   │   ├── main.py                 ← Entrada FastAPI + CORS + routers
│   │   ├── auth.py                 ← JWT + SHA-256 hash (usuaris hardcoded)
│   │   ├── cache.py                ← Redis wrapper (graceful degradation)
│   │   ├── config.py               ← Pydantic Settings
│   │   ├── database.py             ← SQLAlchemy async engine + get_db
│   │   ├── models/
│   │   │   ├── connector.py        ← Credential, Connector (fonts de dades)
│   │   │   ├── kpi.py              ← KPIDefinition, KPIValue, KPIYearAssignment
│   │   │   ├── project.py          ← Project
│   │   │   ├── okr.py              ← OKRObjective, OKRKeyResult, OKRQuarterlyData
│   │   │   ├── value.py            ← ValueItem
│   │   │   └── sync_log.py         ← N8nSyncLog
│   │   ├── schemas/
│   │   │   ├── connector.py        ← Credential/Connector CRUD schemas
│   │   │   ├── kpi.py              ← KPIDefinitionRead, KPIValueRead, KPIValueCreate
│   │   │   ├── project.py          ← ProjectRead, ProjectsSummary
│   │   │   ├── okr.py              ← OKRObjectiveRead, OKRSummaryRead
│   │   │   ├── value.py            ← ValueSummaryRead
│   │   │   ├── ingest.py           ← KPIIngestPayload
│   │   │   ├── dashboard.py        ← DashboardRead, RecentUpdateRead
│   │   │   └── auth.py             ← LoginRequest, TokenResponse
│   │   ├── routers/
│   │   │   ├── auth.py             ← POST /auth/login, GET /auth/me
│   │   │   ├── connectors.py       ← CRUD /settings/credentials/ i /settings/connectors/
│   │   │   ├── dashboard.py        ← GET /dashboard/, GET /dashboard/year/{year}
│   │   │   ├── kpis.py             ← GET/POST /kpis/, /kpis/{code}/values/, /status/
│   │   │   ├── projects.py         ← GET /projects/, PUT /projects/{code}
│   │   │   ├── okrs.py             ← GET /okrs/, PUT /okrs/quarterly/{id}
│   │   │   ├── value.py            ← GET /value/, GET /value/roi/
│   │   │   └── ingest.py           ← POST /ingest/kpi-value, /batch, GET /logs
│   │   └── services/
│   │       ├── calculations.py     ← Tota la logica de calcul (DRY, 40 tests)
│   │       ├── connector_service.py ← CRUD credencials i connectors
│   │       ├── kpi_service.py
│   │       ├── project_service.py
│   │       ├── okr_service.py
│   │       ├── value_service.py
│   │       ├── ingest_service.py
│   │       └── dashboard_service.py ← Orquestra serveis + cache Redis 5 min
│   └── tests/
│       ├── conftest.py             ← Fixtures pytest async
│       ├── test_calculations.py    ← 40 tests logica de negoci
│       └── test_health.py          ← 1 test endpoint /health
│
├── frontend/
│   ├── Dockerfile                  ← Multi-stage: base + dev
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx                ← React entry point
│   │   ├── App.tsx                 ← Router + QueryClientProvider
│   │   ├── lib/utils.ts            ← cn() utility (shadcn)
│   │   ├── styles/
│   │   │   ├── globals.css         ← CSS custom properties (design system)
│   │   │   └── tokens.ts           ← Design tokens per Recharts
│   │   ├── api/client.ts           ← Axios + JWT interceptor
│   │   ├── store/index.ts          ← Zustand (selectedYear=2026, sidebar)
│   │   ├── types/
│   │   │   ├── connector.ts        ← Credential, Connector, SourceType
│   │   │   ├── kpi.ts
│   │   │   ├── project.ts
│   │   │   ├── okr.ts
│   │   │   ├── value.ts
│   │   │   └── dashboard.ts
│   │   ├── hooks/
│   │   │   ├── useConnectors.ts    ← React Query hooks credencials i connectors
│   │   │   ├── useDashboard.ts     ← React Query hook dashboard
│   │   │   └── useKPIs.ts          ← React Query hook KPIs + definition CRUD + years
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       ← Vista principal
│   │   │   ├── KPIsServeis.tsx     ← KPIs amb entrada manual
│   │   │   ├── KPIsProjectes.tsx   ← Placeholder
│   │   │   ├── OKRs.tsx            ← Placeholder
│   │   │   ├── ValorNegoci.tsx     ← Placeholder
│   │   │   ├── EntradaDades.tsx    ← Entrada manual de valors KPI
│   │   │   ├── MasterDades.tsx     ← CRUD definicions KPI, grups, anys
│   │   │   └── Settings.tsx        ← Gestio connectors i credencials
│   │   └── components/
│   │       ├── layout/
│   │       │   ├── AppLayout.tsx   ← Wrapper amb Sidebar + Header
│   │       │   ├── Sidebar.tsx     ← Navegacio (catala)
│   │       │   └── Header.tsx      ← Year selector
│   │       ├── kpis/
│   │       │   ├── KPICard.tsx     ← Component mes critic del projecte
│   │       │   └── KPIValueForm.tsx ← Formulari entrada manual
│   │       ├── okrs/
│   │       │   └── KRProgressBar.tsx
│   │       ├── value/
│   │       │   └── MoneyCard.tsx
│   │       └── shared/
│   │           ├── StatusBadge.tsx  ← Semafor accessible (icona + text + color)
│   │           ├── SkeletonCard.tsx ← Loading state
│   │           ├── EmptyState.tsx   ← Quan no hi ha dades
│   │           └── ErrorBoundary.tsx
│
└── nginx/nginx.conf                ← Reverse proxy: / -> frontend, /api/ -> backend
```

> **Nota**: `design-system/`, `docs/`, `n8n-workflows/` es crearan a les fases posteriors.

---

## 6. Model de Dades

```sql
-- Credentials: credencials reutilitzables per a APIs externes
credentials (
  id UUID PK,
  name VARCHAR(100) UNIQUE,
  auth_type VARCHAR(20),           -- 'basic' | 'bearer' | 'api_key'
  username VARCHAR(200) NULLABLE,
  token TEXT,                      -- emmagatzemat, emmascarat a l'API (****xxxx)
  base_url VARCHAR(500) NULLABLE,
  active BOOLEAN DEFAULT TRUE
)

-- Connectors: fonts de dades configurades
connectors (
  id UUID PK,
  name VARCHAR(200) UNIQUE,
  type VARCHAR(20),                -- 'api_rest' | 'ai_agent'
  credential_id UUID FK → credentials NULLABLE,
  config JSONB NULLABLE,           -- {endpoint, method, headers} o {system_prompt, provider}
  active BOOLEAN DEFAULT TRUE
)

-- KPI Definition: catàleg de KPIs
kpi_definitions (
  id UUID PK,
  code VARCHAR(20) UNIQUE,         -- 'SRV-01', 'PRJ-01', 'VAL-01'
  name VARCHAR(200),
  description TEXT NULLABLE,
  calculation_method TEXT NULLABLE,
  "group" VARCHAR(20),             -- 'serveis' | 'projectes' | 'valor'
  category VARCHAR(50),            -- subcategoria: disponibilitat, incidents, etc.
  unit VARCHAR(20),                -- '%', 'h', '€', '/10', 'Nº'
  target DECIMAL,
  direction VARCHAR(15),           -- 'higher_better' | 'lower_better'
  source VARCHAR(50),              -- descriptiu: 'meraki' | 'aruba' | 'sap' | 'itsm' | 'manual'
  source_type VARCHAR(20),         -- 'manual' | 'api_rest' | 'ai_agent'
  connector_id UUID FK → connectors NULLABLE (ON DELETE SET NULL),
  n8n_workflow_id VARCHAR(100),    -- ID del workflow n8n que col·lecta aquest KPI
  active BOOLEAN DEFAULT TRUE
)

-- KPI Year Assignments: relació M:N entre KPIs i anys
kpi_year_assignments (
  kpi_id UUID FK → kpi_definitions PK,
  year INT PK
)

-- KPI Values: lectures mensuals
kpi_values (
  id UUID PK,
  kpi_id UUID FK → kpi_definitions,
  year INT,
  month INT,                       -- 1-12
  value DECIMAL,
  collected_at TIMESTAMPTZ,
  collection_method VARCHAR(20),   -- 'n8n_automatic' | 'manual'
  notes TEXT
)

-- Projects: cartera de projectes IT
projects (
  id UUID PK,
  code VARCHAR(20) UNIQUE,         -- 'PRJ-01'
  name VARCHAR(200),
  sponsor VARCHAR(100),
  status VARCHAR(20),              -- 'active' | 'completed' | 'at_risk' | 'blocked'
  start_date DATE,
  planned_end_date DATE,
  actual_end_date DATE,
  budget_eur DECIMAL,
  actual_cost_eur DECIMAL,
  completion_pct INT,
  sponsor_satisfaction DECIMAL
)

-- Value Items: Blue/Green Money
value_items (
  id UUID PK,
  project_id UUID FK NULLABLE,
  type VARCHAR(20),                -- 'blue_money' | 'green_money'
  code VARCHAR(20),
  initiative VARCHAR(200),
  hours_saved_annual DECIMAL,
  hourly_rate_eur DECIMAL,
  operational_savings_eur DECIMAL,
  direct_savings_eur DECIMAL,
  revenues_enabled_eur DECIMAL,
  commercial_savings_eur DECIMAL,
  it_attribution_pct DECIMAL,
  year INT
)

-- OKR Objectives
okr_objectives (id UUID PK, year INT, code VARCHAR(10), title TEXT, owner VARCHAR(100), order_idx INT)

-- OKR Key Results
okr_key_results (
  id UUID PK,
  objective_id UUID FK,
  code VARCHAR(15),                -- 'O1.KR1'
  title TEXT,
  unit VARCHAR(20),
  baseline DECIMAL,
  annual_target DECIMAL,
  direction VARCHAR(15),
  kpi_id UUID FK NULLABLE,         -- vinculació automàtica a KPI
  kpi_aggregation VARCHAR(20),     -- 'avg_quarter' | 'sum_cumulative'
  confidence VARCHAR(20)           -- 'Alta' | 'Mitjana' | 'Baixa'
)

-- OKR Quarterly Data
okr_quarterly_data (
  id UUID PK,
  key_result_id UUID FK,
  year INT,
  quarter INT,
  target DECIMAL,
  actual DECIMAL NULLABLE,
  is_manual BOOLEAN DEFAULT FALSE,
  notes TEXT,
  updated_at TIMESTAMPTZ
)

-- n8n Sync Logs
n8n_sync_logs (
  id UUID PK,
  workflow_id VARCHAR(100),
  status VARCHAR(20),              -- 'success' | 'error' | 'partial'
  kpis_collected INT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
)
```

---

## 7. Lògica de Negoci Crítica

> **IMPORTANT (Superpowers TDD):** Escriu els tests d'aquestes funcions PRIMER.
> Estan al cor del sistema. Un error aquí afecta tots els càlculs del dashboard.
> Reprodueixen EXACTAMENT les fórmules de l'Excel `KPIs_OKRs_IT_Sistemes.xlsx`.

```python
# backend/app/services/calculations.py
# Tests: backend/tests/test_calculations.py  ← escriure PRIMER

def kr_progress(actual: float | None, target: float, direction: str) -> float | None:
    """
    Progrés d'un KR per un quarter.
    higher_better: MIN(1, actual/target)
    lower_better:  MIN(1, target/actual)  [SLA, MTTR, cost per tiquet...]
    """
    if actual is None or target == 0:
        return None
    if direction == 'lower_better':
        return min(1.0, target / actual) if actual > 0 else 0.0
    return min(1.0, actual / target)

def kr_annual_progress(quarterly: list[float | None]) -> float | None:
    """Mitjana dels quarters amb dades. Ignora None (trimestres futurs)."""
    with_data = [p for p in quarterly if p is not None]
    return sum(with_data) / len(with_data) if with_data else None

def objective_progress(kr_annuals: list[float | None]) -> float | None:
    """Progrés d'un Objectiu = mitjana dels KRs amb dades."""
    with_data = [p for p in kr_annuals if p is not None]
    return sum(with_data) / len(with_data) if with_data else None

def kpi_status(value: float, target: float, direction: str) -> str:
    """Retorna 'ok' | 'warning' | 'ko' | 'no_data' per al semàfor."""
    progress = kr_progress(value, target, direction)
    if progress is None:   return "no_data"
    if progress >= 0.95:   return "ok"       # ✅
    if progress >= 0.80:   return "warning"  # ⚠️
    return "ko"                              # ❌

def blue_money_item(hours_saved, hourly_rate, op_savings, direct_savings) -> float:
    hours_value = (hours_saved * hourly_rate) if hours_saved and hourly_rate else 0
    return hours_value + (op_savings or 0) + (direct_savings or 0)

def green_money_item(revenues, commercial_savings, it_attribution_pct) -> float:
    return ((revenues or 0) + (commercial_savings or 0)) * (it_attribution_pct or 0)

def global_roi(blue_total, green_total, total_investment) -> float | None:
    if not total_investment: return None
    return (blue_total + green_total - total_investment) / total_investment
```

---

## 8. API Endpoints

```
POST  /api/v1/auth/login
GET   /api/v1/auth/me

GET   /api/v1/dashboard                → resum executiu complet
GET   /api/v1/dashboard/year/{year}

GET   /api/v1/kpis                     → llista amb definicions i estat actual (query: group, category, year)
GET   /api/v1/kpis/all                 → totes les definicions (master data, query: include_inactive)
POST  /api/v1/kpis                     → crear definició KPI
PUT   /api/v1/kpis/{code}              → actualitzar definició (incl. rename code)
DELETE /api/v1/kpis/{code}             → eliminar definició
GET   /api/v1/kpis/{code}/values       → valors mensuals (query: year)
POST  /api/v1/kpis/{code}/values       → entrada manual
PUT   /api/v1/kpis/{code}/values/{id}  → actualitzar valor
DELETE /api/v1/kpis/{code}/values/{id} → eliminar valor
GET   /api/v1/kpis/{code}/status       → semàfor actual
GET   /api/v1/kpis/years/available     → anys amb recompte KPIs
POST  /api/v1/kpis/years/{year}/activate   → assignar any a tots els KPIs actius
POST  /api/v1/kpis/years/{year}/deactivate → treure any de tots els KPIs

GET   /api/v1/settings/credentials/         → llista credencials (token emmascarat)
GET   /api/v1/settings/credentials/summary  → llista mínima per dropdowns
POST  /api/v1/settings/credentials/         → crear credencial
PUT   /api/v1/settings/credentials/{id}     → actualitzar credencial
DELETE /api/v1/settings/credentials/{id}    → eliminar credencial
GET   /api/v1/settings/connectors/          → llista connectors
GET   /api/v1/settings/connectors/summary   → llista mínima per dropdowns
POST  /api/v1/settings/connectors/          → crear connector
PUT   /api/v1/settings/connectors/{id}      → actualitzar connector
DELETE /api/v1/settings/connectors/{id}     → eliminar connector

POST  /api/v1/ingest/kpi-value         ← cridat per n8n (auth: webhook token)
POST  /api/v1/ingest/batch             ← múltiples valors
GET   /api/v1/ingest/logs              → historial de sync n8n

GET   /api/v1/projects
PUT   /api/v1/projects/{code}

GET   /api/v1/okrs                     → objectives + KRs (query: year)
PUT   /api/v1/okrs/quarterly/{id}      → actualitzar dada manual d'un quarter
GET   /api/v1/okrs/quarterly-review    → resum per quarter

GET   /api/v1/value                    → Blue + Green Money (query: year)
GET   /api/v1/value/roi

GET   /api/v1/workflows                → estat de workflows n8n
POST  /api/v1/workflows/{id}/trigger   → executar workflow ara
```

---

## 9. Variables d'Entorn

```bash
# App
APP_ENV=development
SECRET_KEY=canvia_aquesta_clau_en_produccio
N8N_WEBHOOK_TOKEN=token_secret_per_autenticar_ingest_des_de_n8n

# Base de dades
DATABASE_URL=postgresql+asyncpg://kpi_user:password@postgres:5432/kpi_db

# Redis
REDIS_URL=redis://redis:6379/0

# n8n (connector)
N8N_API_URL=https://n8n-n8n.rowjve.easypanel.host
N8N_API_KEY=

# Paràmetres de negoci (configurables, afecten Blue Money)
HOURLY_RATE_TECHNICAL=45
HOURLY_RATE_ADMIN=35
HOURLY_RATE_OPERATOR=22
```

---

## 10. Seed Data: Migració des de l'Excel

El seed script (`backend/scripts/seed_from_excel.py`) utilitza SQLAlchemy sync amb `psycopg2`
(no async) perque s'executa una sola vegada.

```bash
# Prerequisit: copiar l'Excel a l'arrel del projecte
# El docker-compose.dev.yml el munta a /data/

# Execucio (en Git Bash/Windows cal MSYS_NO_PATHCONV=1)
MSYS_NO_PATHCONV=1 docker compose exec backend python -m scripts.seed_from_excel /data/KPIs_OKRs_IT_Sistemes.xlsx

# Alternativa sense fitxer Excel (genera dades de mostra)
docker compose exec backend python -m scripts.seed_from_excel
```

**Pestanyes que llegeix de l'Excel:**

| Pestanya | Dades importades | Registres |
|----------|-----------------|-----------|
| KPIs Serveis | 12 KPIs (SRV-01..SRV-12) + 12 mesos | 144 valors |
| KPIs Projectes | 8 projectes + 8 KPIs mensuals (PRJ-M01..M08) | 8 + 96 valors |
| Valor Negoci | 8 Blue Money (BM-01..08) + 5 Green Money (GM-01..05) | 13 items |
| OKRs | 5 objectius + 20 Key Results + dades Q1-Q4 | 80 quarters |

**Totals verificats contra l'Excel:**
- Blue Money: 233.650 EUR
- Green Money: 400.600 EUR

**Direccio dels KPIs** (important per als calculs de semafor):
- `lower_better`: SRV-03, SRV-04, SRV-05, SRV-07, SRV-08, SRV-11, PRJ-M02, PRJ-M04
- La resta: `higher_better`

---

## 11. Prioritats d'Implementacio

### Fase 1 — MVP ✅ COMPLETADA
- [x] Docker Compose + PostgreSQL + Redis + FastAPI skeleton + React skeleton
- [x] Migracions Alembic (8 taules: kpi_definitions, kpi_values, projects, value_items, okr_objectives, okr_key_results, okr_quarterly_data, n8n_sync_logs)
- [x] Seed des de l'Excel (dades reals verificades)
- [x] CRUD API: KPIs, Projectes, OKRs, Value Items (7 routers)
- [x] **Dashboard** — pagina principal amb tots els blocs i dades reals
- [x] Entrada manual de KPIs (KPIValueForm)
- [x] 41 tests backend passant (40 calculations + 1 health)
- [x] Auth JWT amb usuaris hardcoded (admin/viewer)

### Fase 1.5 — Master de Dades i Connectors ✅ COMPLETADA
- [x] **Master de Dades** — pagina CRUD definicions KPI (grup/subcategoria/descripció/càlcul)
- [x] Model grup/subcategoria: serveis (SRV-), projectes (PRJ-), valor (VAL-)
- [x] Gestió d'anys (activar/desactivar any per tots els KPIs)
- [x] Taula kpi_year_assignments (M:N KPI↔any)
- [x] **Sistema de connectors**: Credential + Connector models amb Alembic
- [x] Tres tipus de font per KPI: manual, API REST (amb credencial), Agent IA (amb system prompt)
- [x] CRUD credencials amb tokens emmascarats (****xxxx)
- [x] CRUD connectors (api_rest amb credential+endpoint, ai_agent amb system_prompt)
- [x] **Pàgina Configuració** (`/configuracio`) — gestió connectors i credencials
- [x] Selector font de dades al formulari MasterDades (Manual/API REST/Agent IA + connector)
- [x] 10 endpoints nous sota /api/v1/settings/
- [x] Zustand default year canviat a 2026

### Fase 2 — Connectors n8n
7. Workflow ITSM (maxim impacte: SRV-03..08, SRV-11, SRV-12)
8. Workflow Meraki (SRV-01, SRV-02 oficines)
9. Workflow Aruba (SRV-02 factories/magatzems)
10. Workflow SAP (costos, desviacio pressupost)
11. Integració connectors configurats amb execucio real (API REST fetch, Rovo agent)

### Fase 3 — OKRs i Valor Negoci
12. Pagina OKRs completa amb progres automatic vinculat a KPIs
13. Pagina Valor Negoci completa: Blue Money, Green Money, ROI
14. Retrospectiva trimestral editable per quarter

### Fase 4 — Poliment
15. Export PDF de l'informe executiu
16. WebSocket: actualitzacions en temps real al dashboard
17. Alertes automatiques via n8n quan KPI < threshold

---

## 12. Decisions de Disseny

| Decisio | Rao |
|---------|-----|
| **n8n en lloc de Celery** | Interficie visual per debugar, menys codi, servidor ja disponible via MCP |
| **Idioma UI: Catala** | Usuaris corporatius. Codi i comentaris en angles. |
| **API-first** | Frontend es client pur de l'API. Tota la logica al backend. |
| **Sense SSO al MVP** | JWT simple. Active Directory en fases posteriors si es requereix. |
| **Design system persistent** | `design-system/MASTER.md` es la font de veritat visual. Prioritat absoluta. |
| **TDD estricte** | Tests escrits ABANS del codi de produccio. Superpowers ho imposa. |
| **YAGNI** | No implementis multi-rol, i18n, ni exports avancats fins a la fase corresponent. |
| **SHA-256 en lloc de bcrypt** | passlib/bcrypt incompatible amb Python 3.13. SHA-256 suficient per MVP amb usuaris hardcoded. |
| **Dades any 2025, default 2026** | Dades seed son de l'any 2025. El store Zustand default es `selectedYear: 2026`. |
| **Grup + Subcategoria** | `group` (serveis/projectes/valor) es la classificacio principal. `category` es la subcategoria (disponibilitat, incidents...). El prefix del codi (SRV-/PRJ-/VAL-) ha de coincidir amb el grup. |
| **Connectors configurables** | Tres tipus de font per KPI: manual, api_rest (amb credencial i URL), ai_agent (amb system prompt). Credencials reutilitzables entre connectors. Tokens emmascarats a l'API. |
| **Trailing slashes a l'API** | FastAPI retorna 307 redirect sense trailing slash. Tots els endpoints del client usen `/`. |
| **Redis graceful degradation** | `cache.py` retorna `None` si `REDIS_URL` es buit. El dashboard funciona sense Redis. |
| **Seed sync (psycopg2)** | El seed script usa SQLAlchemy sync, no async. S'executa una sola vegada via Docker exec. |
| **MSYS_NO_PATHCONV** | En Git Bash (Windows), cal `MSYS_NO_PATHCONV=1` per evitar conversio de paths `/data/` a `C:/Program Files/Git/data/`. |

---

## 13. Context de l'Entorn Corporatiu

- **Xarxa oficines**: Cisco Meraki (cloud-managed, API disponible)
- **Xarxa factories/magatzems**: HPE Aruba Central (API OAuth2)
- **ERP**: SAP — referència de costos: transacció `S_ALR_87013611`
- **n8n**: `https://n8n-n8n.rowjve.easypanel.host` (MCP configurat)
- **Documentació**: Confluence (exportació via API a Fase 4)
- **Equip IT**: 6 tècnics de sistemes
- **Servidor**: VM corporativa Linux — possible sense accés internet públic.
  Tots els connectors han de funcionar en xarxa interna o VPN.

---

## 14. Quan Tinguis Dubtes

| Dubte | On trobar la resposta |
|-------|-----------------------|
| Lògica de càlcul (progrés KR, Blue/Green Money) | Excel `KPIs_OKRs_IT_Sistemes.xlsx` pestanyes `🎯 OKRs` i `💰 Valor Negoci` |
| Decisions d'arquitectura de sessions anteriors | `search(query="...", type="architecture")` via claude-mem |
| Disseny visual d'un component nou | `design-system/MASTER.md` primer; si no cobreix: `python3 skills/ui-ux-pro-max/scripts/search.py "..." --domain ux --stack shadcn` |
| Construcció d'un workflow n8n | Demanar directament amb n8n-skills actiu; els skills d'expressió, validació i patrons s'activen sols |
| Decisió no coberta aquí | Principi de mínima sorpresa. Solució més simple que funcioni. Documentar aquí. |
| Colors o estil visual | `design-system/MASTER.md` té prioritat absoluta. Si no existeix: secció 3.2. |