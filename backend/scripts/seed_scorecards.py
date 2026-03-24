"""
Seed all departmental scorecards and objectives for 2026.

Data source: Org chart objectives provided by Dani Salvat (March 2026).
Idempotent: clears existing scorecards and recreates.

Usage:
  docker compose exec backend python -m scripts.seed_scorecards
"""

import sys
import uuid
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings

_db_url = settings.DATABASE_URL
if "sqlite" in _db_url:
    SYNC_URL = _db_url.replace("+aiosqlite", "").replace("aiosqlite", "sqlite")
else:
    SYNC_URL = _db_url.replace("+asyncpg", "+psycopg2").replace("asyncpg", "psycopg2")

YEAR = 2026


def _id():
    return str(uuid.uuid4())


def _shared():
    """Generate a shared_group_id for objectives shared between teams."""
    return str(uuid.uuid4())


def seed(session: Session):
    # Clear existing scorecards
    session.execute(text("DELETE FROM indicator_values;"))
    session.execute(text("DELETE FROM scorecard_indicators;"))
    session.execute(text("DELETE FROM scorecards;"))
    session.flush()

    # ── Get org entity IDs ──
    def get_id(table, code_or_name, field="code"):
        row = session.execute(
            text(f"SELECT id FROM {table} WHERE {field} = :v"),
            {"v": code_or_name},
        ).fetchone()
        if not row:
            raise ValueError(f"{table} with {field}={code_or_name} not found")
        return str(row[0])

    company_id = get_id("companies", "ametller-origen", "slug")
    dept_id = get_id("departments", "DGSI")
    area_ops_id = get_id("areas", "DESOP11")
    area_transf_id = get_id("areas", "DESOP11T")
    area_idia_id = get_id("areas", "DESINT11")
    team_sis_id = get_id("teams", "SIS")
    team_pos_id = get_id("teams", "POS")
    team_ciber_id = get_id("teams", "CIBER")
    team_data_id = get_id("teams", "DATA")
    team_integ_id = get_id("teams", "INTEG")

    # ── Shared group IDs for cross-team objectives ──
    shared_plataforma_n1 = _shared()
    shared_sdwan_ztna = _shared()
    shared_alertes_jira = _shared()
    shared_sprint = _shared()

    # ══════════════════════════════════════════════════════
    # Helper to create scorecard + indicators
    # ══════════════════════════════════════════════════════
    def create_scorecard(org_level, org_entity_id, name, indicators, op_weight=50, mgmt_weight=50):
        sc_id = _id()
        session.execute(text(
            "INSERT INTO scorecards (id, company_id, year, org_level, org_entity_id, name, "
            "operational_weight, management_weight, active) "
            "VALUES (:id, :cid, :year, :level, :eid, :name, :ow, :mw, true)"
        ), {
            "id": sc_id, "cid": company_id, "year": YEAR, "level": org_level,
            "eid": org_entity_id, "name": name, "ow": op_weight, "mw": mgmt_weight,
        })

        for idx, ind in enumerate(indicators):
            ind_id = _id()
            session.execute(text(
                "INSERT INTO scorecard_indicators "
                "(id, scorecard_id, name, description, category, indicator_type, "
                "target_value, unit, weight_pct, direction, frequency, source, "
                "shared_group_id, order_idx, active) "
                "VALUES (:id, :sid, :name, :desc, :cat, :type, :target, :unit, "
                ":weight, :dir, :freq, :source, :shared, :idx, true)"
            ), {
                "id": ind_id, "sid": sc_id,
                "name": ind["name"],
                "desc": ind.get("description"),
                "cat": ind["category"],
                "type": ind.get("type", "continuous"),
                "target": ind["target"],
                "unit": ind.get("unit", "%"),
                "weight": ind["weight"],
                "dir": ind.get("direction", "higher_better"),
                "freq": ind.get("frequency", "monthly"),
                "source": ind.get("source", "manual"),
                "shared": ind.get("shared_group_id"),
                "idx": idx,
            })
        return sc_id

    # ══════════════════════════════════════════════════════
    # 1. DG SISTEMES INFORMÀTICS (Department)
    # ══════════════════════════════════════════════════════
    create_scorecard("department", dept_id, "DG Sistemes Informàtics", [
        # Operacionals (50%)
        {"name": "SLA de Temps de primera Resposta", "category": "operational",
         "target": 98, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        {"name": "No superar 400 tickets de backlog > X vegades", "category": "operational",
         "target": 6, "unit": "vegades", "weight": 16.67, "direction": "lower_better",
         "type": "count", "source": "jira", "frequency": "monthly"},
        {"name": "Temps de resolució", "category": "operational",
         "target": 80, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        # Gestió (50%)
        {"name": "Satisfacció de l'usuari", "category": "management",
         "target": 9.5, "unit": "/10", "weight": 16.67, "source": "jira",
         "frequency": "quarterly"},
        {"name": "Temps imputat de l'equip", "category": "management",
         "target": 80, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        {"name": "Totes les issues (Peticions de Canvi) amb Due Date", "category": "management",
         "target": 80, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
    ])

    # ══════════════════════════════════════════════════════
    # 2. ÀREA TRANSFORMACIÓ (Area)
    # ══════════════════════════════════════════════════════
    create_scorecard("area", area_transf_id, "Àrea Transformació", [
        # Projectes Clau Grup Ametller (50%) — tipus binary
        {"name": "Picking per veu completat", "category": "operational",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        {"name": "Sistema de Gestió de Molls", "category": "operational",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        {"name": "Hedyla + Instaleap", "category": "operational",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        # Projectes Clau Departament IT (50%) — tipus binary
        {"name": "Sistema Batec implantat internament", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        {"name": "Sistema gestió de la Demanda", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        {"name": "Sistema de Monitorització de Projectes", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
    ])

    # ══════════════════════════════════════════════════════
    # 3. ÀREA INTEGRACIONS, DATA i IA (Area)
    # ══════════════════════════════════════════════════════
    create_scorecard("area", area_idia_id, "Àrea Integracions, Data i IA", [
        # Operacionals (50%)
        {"name": "FinOps < X slots", "category": "operational",
         "target": 200, "unit": "slots", "weight": 16.67, "direction": "lower_better",
         "type": "count", "frequency": "monthly"},
        {"name": "Objectius Data (operacionals)", "category": "operational",
         "target": 100, "unit": "%", "weight": 16.67, "frequency": "quarterly",
         "description": "Assoliment objectius operacionals equip Data"},
        {"name": "Objectius Integracions (operacionals)", "category": "operational",
         "target": 100, "unit": "%", "weight": 16.67, "frequency": "quarterly",
         "description": "Assoliment objectius operacionals equip Integracions"},
        # Gestió (50%)
        {"name": "Objectius Data (gestió)", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "frequency": "quarterly",
         "description": "Assoliment objectius de gestió equip Data"},
        {"name": "Objectius Integracions (gestió)", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "frequency": "quarterly",
         "description": "Assoliment objectius de gestió equip Integracions"},
        {"name": "CoE IA en funcionament", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
    ])

    # ══════════════════════════════════════════════════════
    # 4. EQUIP SISTEMES (Team)
    # ══════════════════════════════════════════════════════
    create_scorecard("team", team_sis_id, "Equip Sistemes", [
        # Operacionals (50%) — 4 indicadors a 12.50%
        {"name": "SLA de Disponibilitat de Connectivitat", "category": "operational",
         "target": 99.70, "unit": "%", "weight": 12.50, "source": "meraki",
         "frequency": "monthly"},
        {"name": "Temps de resolució P1 < 2 hores", "category": "operational",
         "target": 99, "unit": "%", "weight": 12.50, "source": "jira",
         "frequency": "monthly"},
        {"name": "Incidents recurrents (mateix botiga) no superior a 3 mensual (10/12 mesos)",
         "category": "operational",
         "target": 83, "unit": "%", "weight": 12.50, "source": "jira",
         "frequency": "monthly"},
        {"name": "MTTR Incidents P1/P2 < 5 hores", "category": "operational",
         "target": 85, "unit": "%", "weight": 12.50, "source": "jira",
         "frequency": "monthly"},
        # Gestió (50%) — 3 indicadors a 16.67%
        {"name": "Projecte Plataforma de Gestió Autònoma per N1", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly", "shared_group_id": shared_plataforma_n1},
        {"name": "Securització de la Wifi de les Botigues", "category": "management",
         "target": 50, "unit": "botigues", "weight": 16.67, "type": "count",
         "frequency": "monthly"},
        {"name": "SD-WAN i ZTNA general (2 botigues per setmana)", "category": "management",
         "target": 55, "unit": "%", "weight": 16.67,
         "frequency": "monthly", "shared_group_id": shared_sdwan_ztna},
    ])

    # ══════════════════════════════════════════════════════
    # 5. EQUIP PoS/TPV (Team)
    # ══════════════════════════════════════════════════════
    create_scorecard("team", team_pos_id, "Equip PoS / TPV", [
        # Operacionals (50%)
        {"name": "Tickets Processats en < 15 minuts", "category": "operational",
         "target": 97, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        {"name": "Coverage de Testing", "category": "operational",
         "target": 60, "unit": "%", "weight": 16.67,
         "frequency": "monthly"},
        {"name": "Conciliació de tickets < 8 dies", "category": "operational",
         "target": 90, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        # Gestió (50%)
        {"name": "SCO implantat (100 màquines)", "category": "management",
         "target": 80, "unit": "%", "weight": 16.67,
         "frequency": "quarterly"},
        {"name": "PoS 5.X implantat", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        {"name": "Dinamització de Promocions (agilitzar/automatitzar promocions a dins botiga)",
         "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
    ])

    # ══════════════════════════════════════════════════════
    # 6. EQUIP CIBERSEGURETAT & PROCESSOS (Team)
    # ══════════════════════════════════════════════════════
    create_scorecard("team", team_ciber_id, "Equip Ciberseguretat & Processos", [
        # Operacionals (50%)
        {"name": "% de tickets resolts per Primer Nivell (Pendent Baseline)", "category": "operational",
         "target": 70, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        {"name": "Time to scale", "category": "operational",
         "target": 95, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly"},
        {"name": "Check de: Correus, backups, SIEM, Vulnerabilitat i Cynet revisats a diari",
         "category": "operational",
         "target": 98, "unit": "%", "weight": 16.67,
         "frequency": "monthly"},
        # Gestió (50%)
        {"name": "Projecte Plataforma de Gestió Autònoma per N1", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly", "shared_group_id": shared_plataforma_n1},
        {"name": "SD-WAN i ZTNA general (2 botigues per setmana)", "category": "management",
         "target": 55, "unit": "%", "weight": 16.67,
         "frequency": "monthly", "shared_group_id": shared_sdwan_ztna},
        {"name": "100% MFA per: VPN & Comptes d'administradors", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
    ])

    # ══════════════════════════════════════════════════════
    # 7. EQUIP DATA (Team)
    # ══════════════════════════════════════════════════════
    create_scorecard("team", team_data_id, "Equip Data", [
        # Operacionals (50%) — 4 indicadors a 12.50%
        {"name": "Dataform MTTR (Mean Time to Recovery) inferior a 15'", "category": "operational",
         "target": 100, "unit": "%", "weight": 12.50, "source": "dataform",
         "frequency": "monthly"},
        {"name": "Processos de dataform executats correctament", "category": "operational",
         "target": 98, "unit": "%", "weight": 12.50, "source": "dataform",
         "frequency": "monthly"},
        {"name": "Cap dashboard amb taules legacy a finals d'any", "category": "operational",
         "target": 90, "unit": "%", "weight": 12.50,
         "frequency": "quarterly"},
        {"name": "Assoliment objectius sprint", "category": "operational",
         "target": 80, "unit": "%", "weight": 12.50, "source": "jira",
         "frequency": "monthly", "shared_group_id": shared_sprint},
        # Gestió (50%) — 3 indicadors a 16.67%
        {"name": "Catàleg de KPIs (75 kpis identificats i controlats)", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67,
         "frequency": "quarterly",
         "description": "Objectiu: 75 KPIs identificats i controlats"},
        {"name": "Data quality (80 processos prioritaris)", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67,
         "frequency": "quarterly",
         "description": "Objectiu: 80 processos prioritaris amb data quality"},
        {"name": "Sistema de Centralització d'alertes integrades amb Jira",
         "category": "management",
         "target": 50, "unit": "%", "weight": 16.67,
         "frequency": "quarterly", "shared_group_id": shared_alertes_jira},
    ])

    # ══════════════════════════════════════════════════════
    # 8. EQUIP INTEGRACIONS (Team)
    # ══════════════════════════════════════════════════════
    create_scorecard("team", team_integ_id, "Equip Integracions", [
        # Operacionals (50%)
        {"name": "Cues executades correctament", "category": "operational",
         "target": 99.5, "unit": "%", "weight": 16.67,
         "frequency": "monthly"},
        {"name": "Jobs sense errors", "category": "operational",
         "target": 98, "unit": "%", "weight": 16.67,
         "frequency": "monthly"},
        {"name": "Assoliment objectius sprint", "category": "operational",
         "target": 80, "unit": "%", "weight": 16.67, "source": "jira",
         "frequency": "monthly", "shared_group_id": shared_sprint},
        # Gestió (50%)
        {"name": "Implantació Apigee", "category": "management",
         "target": 100, "unit": "%", "weight": 16.67, "type": "binary",
         "frequency": "quarterly"},
        {"name": "PIM Executat", "category": "management",
         "target": 80, "unit": "%", "weight": 16.67,
         "frequency": "quarterly"},
        {"name": "Sistema de Centralització d'alertes integrades amb Jira",
         "category": "management",
         "target": 50, "unit": "%", "weight": 16.67,
         "frequency": "quarterly", "shared_group_id": shared_alertes_jira},
    ])

    session.commit()

    # ── Summary ──
    sc_count = session.execute(text("SELECT COUNT(*) FROM scorecards")).scalar()
    ind_count = session.execute(text("SELECT COUNT(*) FROM scorecard_indicators")).scalar()
    print(f"\n✅ Scorecards creats correctament:")
    print(f"   {sc_count} scorecards (1 dept + 2 àrees + 5 equips)")
    print(f"   {ind_count} indicadors totals")
    print(f"   Any: {YEAR}")
    print(f"\n   Objectius compartits:")
    print(f"   🔗 Plataforma Gestió Autònoma N1 → Sistemes + Ciberseguretat")
    print(f"   🔗 SD-WAN i ZTNA general → Sistemes + Ciberseguretat")
    print(f"   🔗 Centralització alertes amb Jira → Data + Integracions")
    print(f"   🔗 Assoliment objectius sprint → Data + Integracions")


if __name__ == "__main__":
    engine = create_engine(SYNC_URL)
    with Session(engine) as session:
        seed(session)
