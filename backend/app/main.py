from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, budget, connectors, dashboard, ingest, kpis, okrs, projects, value

app = FastAPI(title="KPI Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:80", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(kpis.router)
app.include_router(ingest.router)
app.include_router(projects.router)
app.include_router(okrs.router)
app.include_router(value.router)
app.include_router(connectors.router)
app.include_router(budget.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
