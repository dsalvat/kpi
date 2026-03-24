"""
Seed the full organizational structure for DG Sistemes Informàtics.

Matches the official org chart as of March 2026.
Idempotent: clears existing org data and recreates from scratch.

Usage:
  docker compose exec backend python -m scripts.seed_org_structure
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


def _id():
    return str(uuid.uuid4())


def seed(session: Session):
    # --- Clear existing org data (order matters for FKs) ---
    session.execute(text(
        "UPDATE departments SET director_id = NULL;"
    ))
    session.execute(text(
        "UPDATE areas SET responsable_id = NULL;"
    ))
    session.execute(text(
        "UPDATE teams SET coordinador_id = NULL;"
    ))
    session.execute(text("DELETE FROM members;"))
    session.execute(text("DELETE FROM teams;"))
    session.execute(text("DELETE FROM areas;"))
    session.execute(text("DELETE FROM departments;"))
    session.execute(text("DELETE FROM companies;"))
    session.flush()

    # ══════════════════════════════════════════════════════
    # COMPANY
    # ══════════════════════════════════════════════════════
    company_id = _id()
    session.execute(text(
        "INSERT INTO companies (id, name, slug, active) VALUES (:id, :name, :slug, true)"
    ), {"id": company_id, "name": "Ametller Origen", "slug": "ametller-origen"})

    # ══════════════════════════════════════════════════════
    # DEPARTMENT: DG Sistemes Informàtics
    # ══════════════════════════════════════════════════════
    dept_id = _id()
    session.execute(text(
        "INSERT INTO departments (id, company_id, code, name, description, active) "
        "VALUES (:id, :cid, :code, :name, :desc, true)"
    ), {
        "id": dept_id, "cid": company_id, "code": "DGSI",
        "name": "DG Sistemes Informàtics",
        "desc": "Direcció General de Sistemes Informàtics",
    })

    # ══════════════════════════════════════════════════════
    # AREAS
    # ══════════════════════════════════════════════════════
    area_ops_id = _id()
    area_transf_id = _id()
    area_idia_id = _id()

    areas = [
        (area_ops_id, "DESOP11", "Operacions", "Àrea d'Operacions IT"),
        (area_transf_id, "DESOP11T", "Transformació", "Àrea de Transformació"),
        (area_idia_id, "DESINT11", "Integracions, Data i IA", "Àrea d'Integracions, Data i IA"),
    ]
    for aid, code, name, desc in areas:
        session.execute(text(
            "INSERT INTO areas (id, department_id, code, name, description, active) "
            "VALUES (:id, :did, :code, :name, :desc, true)"
        ), {"id": aid, "did": dept_id, "code": code, "name": name, "desc": desc})

    # ══════════════════════════════════════════════════════
    # TEAMS
    # ══════════════════════════════════════════════════════
    # Operacions teams
    team_sis_id = _id()
    team_pos_id = _id()
    team_ciber_id = _id()
    team_mp_id = _id()
    # IDiIA teams
    team_data_id = _id()
    team_integ_id = _id()
    team_ia_id = _id()

    teams = [
        # Operacions
        (team_sis_id, area_ops_id, "SIS", "Sistemes", "Equip de Sistemes"),
        (team_pos_id, area_ops_id, "POS", "PoS / TPV", "Equip de Punt de Venda / TPV"),
        (team_ciber_id, area_ops_id, "CIBER", "Ciberseguretat & Processos", "Equip de Ciberseguretat i Processos (1r nivell suport)"),
        (team_mp_id, area_ops_id, "MP", "Mitjans Pagament", "Equip de Mitjans de Pagament (extern)"),
        # IDiIA
        (team_data_id, area_idia_id, "DATA", "Data", "Equip de Data / Enginyeria de Dades"),
        (team_integ_id, area_idia_id, "INTEG", "Integracions", "Equip d'Integracions"),
        (team_ia_id, area_idia_id, "IA", "Intel·ligència Artificial", "Equip d'IA (pendent de creació)"),
    ]
    for tid, aid, code, name, desc in teams:
        session.execute(text(
            "INSERT INTO teams (id, area_id, code, name, description, active) "
            "VALUES (:id, :aid, :code, :name, :desc, true)"
        ), {"id": tid, "aid": aid, "code": code, "name": name, "desc": desc})

    # ══════════════════════════════════════════════════════
    # MEMBERS
    # ══════════════════════════════════════════════════════
    def email(first, last):
        f = first.lower().replace(" ", "").replace("à", "a").replace("è", "e").replace("é", "e").replace("í", "i").replace("ò", "o").replace("ú", "u").replace("ü", "u")
        l = last.lower().replace(" ", "").replace("à", "a").replace("è", "e").replace("é", "e").replace("í", "i").replace("ò", "o").replace("ú", "u").replace("ü", "u")
        return f"{f}.{l}@ametller.cat"

    members = []

    def add(first, last, team_id, role, position):
        mid = _id()
        members.append({
            "id": mid, "cid": company_id, "tid": team_id,
            "first": first, "last": last,
            "email": email(first, last),
            "role": role, "position": position,
        })
        return mid

    # ── Director DG ──
    # Director needs a team. We'll put him in Sistemes nominally but set as director.
    # Actually, the model requires team_id. Let's create a virtual "Direcció" team under a virtual area,
    # or just assign to first team. Better: we need somewhere for director/responsables.
    # The model says "one person, one team". Director/responsables have roles but belong to a team.
    # Per the org chart, Dani Salvat is at department level. We'll assign him to Sistemes team
    # with role=director. Same for area responsables - they belong to a team under their area.

    # For responsables who don't have a specific team, we assign them to the first team of their area.
    # Sergio Jimenez (Transformació) has no teams - we need a placeholder team.

    # Create a placeholder team for Transformació
    team_transf_id = _id()
    session.execute(text(
        "INSERT INTO teams (id, area_id, code, name, description, active) "
        "VALUES (:id, :aid, :code, :name, :desc, true)"
    ), {"id": team_transf_id, "aid": area_transf_id, "code": "TRANSF",
        "name": "Transformació", "desc": "Equip de Transformació (pendent estructurar)"})

    # --- Director ---
    dani_id = add("Dani", "Salvat", team_sis_id, "director", "Director DG Sistemes Informàtics")

    # --- Responsables d'àrea ---
    # Operacions: VACANT (no member)
    sergio_id = add("Sergio", "Jimenez", team_transf_id, "responsable", "Responsable Transformació")
    roger_a_id = add("Roger", "Artiga", team_data_id, "responsable", "Responsable Integracions, Data i IA")

    # --- Equip Sistemes (coord: Francesc Olivella) ---
    francesc_id = add("Francesc", "Olivella", team_sis_id, "coordinador", "Coordinador Sistemes")
    add("Roger", "Vilalta", team_sis_id, "membre", "Tècnic de Sistemes")
    add("Ignasi", "Angrill", team_sis_id, "membre", "Tècnic de Sistemes")
    add("José", "Arroyo", team_sis_id, "membre", "Tècnic de Sistemes")
    add("Victor", "Mansilla", team_sis_id, "membre", "Tècnic de Sistemes")
    add("Antonio", "Perez", team_sis_id, "membre", "Tècnic de Sistemes")
    add("Gabriel", "Ventrice", team_sis_id, "membre", "Tècnic de Sistemes")

    # --- Equip PoS/TPV (coord: Fruit Herrera) ---
    fruit_id = add("Fruit", "Herrera", team_pos_id, "coordinador", "Coordinador PoS / TPV")
    add("Victor", "Algarra", team_pos_id, "membre", "Tècnic Eng. Software TPV")
    add("Roger", "Benedicto", team_pos_id, "membre", "Tècnic Eng. Software TPV")
    add("Arnau", "Ferret", team_pos_id, "membre", "Tècnic Eng. Software TPV")

    # --- Equip Ciberseguretat & Processos (coord: Hector Agea) ---
    hector_id = add("Hector", "Agea", team_ciber_id, "coordinador", "Coordinador Ciberseguretat i Processos")
    add("Cinta", "Marquez", team_ciber_id, "membre", "Tècnic Ciberseguretat")
    add("Irina", "Illa", team_ciber_id, "membre", "Tècnic Suport")
    add("Borja", "Martínez", team_ciber_id, "membre", "Tècnic Suport")

    # --- Equip Mitjans Pagament (coord: David Espinosa, extern) ---
    david_id = add("David", "Espinosa", team_mp_id, "coordinador", "Coordinador Mitjans Pagament (Extern)")
    add("Sergi", "Ribas", team_mp_id, "membre", "Tècnic Suport (Extern)")

    # --- Equip Transformació (resp: Sergio Jimenez, sense equip encara) ---
    # Already added Sergio above

    # --- Equip Data (coord: Hernan Sosa) ---
    hernan_id = add("Hernan", "Sosa", team_data_id, "coordinador", "Coordinador Data")
    add("Pau", "Clavera", team_data_id, "membre", "Tècnic Eng. Dades")
    add("Oscar", "Serra", team_data_id, "membre", "Tècnic Eng. Dades")
    add("Nil", "Currius", team_data_id, "membre", "Tècnic Eng. Dades")

    # --- Equip Integracions (coord: Daniel Sanchez) ---
    daniel_id = add("Daniel", "Sanchez", team_integ_id, "coordinador", "Coordinador Integracions")
    add("Gerard", "Tort", team_integ_id, "membre", "Tècnic Eng. Software")
    add("Adrià", "Cuscullola", team_integ_id, "membre", "Tècnic Eng. Software")
    add("Dhaily", "Robles", team_integ_id, "membre", "Tècnic Eng. Software")
    add("Juanjo", "Aparicio", team_integ_id, "membre", "Tècnic Eng. Software")

    # --- Equip IA (vacant) ---
    # No members yet

    # Insert all members
    for m in members:
        session.execute(text(
            "INSERT INTO members (id, company_id, team_id, first_name, last_name, email, role, position, active) "
            "VALUES (:id, :cid, :tid, :first, :last, :email, :role, :position, true)"
        ), m)

    session.flush()

    # ══════════════════════════════════════════════════════
    # SET COORDINADORS, RESPONSABLES, DIRECTOR
    # ══════════════════════════════════════════════════════

    # Department director
    session.execute(text(
        "UPDATE departments SET director_id = :did WHERE id = :id"
    ), {"did": dani_id, "id": dept_id})

    # Area responsables
    # Operacions: VACANT (NULL)
    session.execute(text(
        "UPDATE areas SET responsable_id = :rid WHERE id = :id"
    ), {"rid": sergio_id, "id": area_transf_id})
    session.execute(text(
        "UPDATE areas SET responsable_id = :rid WHERE id = :id"
    ), {"rid": roger_a_id, "id": area_idia_id})

    # Team coordinadors
    coord_map = [
        (team_sis_id, francesc_id),
        (team_pos_id, fruit_id),
        (team_ciber_id, hector_id),
        (team_mp_id, david_id),
        (team_data_id, hernan_id),
        (team_integ_id, daniel_id),
    ]
    for tid, cid in coord_map:
        session.execute(text(
            "UPDATE teams SET coordinador_id = :cid WHERE id = :id"
        ), {"cid": cid, "id": tid})

    session.commit()

    # ══════════════════════════════════════════════════════
    # SUMMARY
    # ══════════════════════════════════════════════════════
    count = session.execute(text("SELECT COUNT(*) FROM members")).scalar()
    teams_count = session.execute(text("SELECT COUNT(*) FROM teams")).scalar()
    print(f"\n✅ Organització creada correctament:")
    print(f"   1 empresa: Ametller Origen")
    print(f"   1 departament: DG Sistemes Informàtics (Director: Dani Salvat)")
    print(f"   3 àrees: Operacions, Transformació, Integracions Data i IA")
    print(f"   {teams_count} equips")
    print(f"   {count} membres")


if __name__ == "__main__":
    engine = create_engine(SYNC_URL)
    with Session(engine) as session:
        seed(session)
