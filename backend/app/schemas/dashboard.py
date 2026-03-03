from pydantic import BaseModel

from app.schemas.kpi import KPIDefinitionRead
from app.schemas.okr import OKRSummaryRead
from app.schemas.project import ProjectsSummary
from app.schemas.value import ValueSummaryRead


class RecentUpdateRead(BaseModel):
    kpi_code: str
    kpi_name: str
    value: float
    month: int
    year: int
    collection_method: str


class DashboardRead(BaseModel):
    year: int
    kpi_summary: list[KPIDefinitionRead]
    projects_summary: ProjectsSummary
    okr_summary: OKRSummaryRead
    value_summary: ValueSummaryRead
    recent_updates: list[RecentUpdateRead] = []
