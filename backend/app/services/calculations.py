"""Core business logic calculations.

This is the SINGLE source of truth for all formulas (DRY principle).
These are pure functions with no database dependencies.
Reproduces exactly the formulas from KPIs_OKRs_IT_Sistemes.xlsx.
"""


def kr_progress(actual: float | None, target: float, direction: str) -> float | None:
    """
    Progress of a KR for a quarter.
    higher_better: MIN(1, actual/target)
    lower_better:  MIN(1, target/actual)
    """
    if actual is None or target == 0:
        return None
    if direction == "lower_better":
        return min(1.0, target / actual) if actual > 0 else 0.0
    return min(1.0, actual / target)


def kr_annual_progress(quarterly: list[float | None]) -> float | None:
    """Average of quarters with data. Ignores None (future quarters)."""
    with_data = [p for p in quarterly if p is not None]
    return sum(with_data) / len(with_data) if with_data else None


def objective_progress(kr_annuals: list[float | None]) -> float | None:
    """Objective progress = average of KRs with data."""
    with_data = [p for p in kr_annuals if p is not None]
    return sum(with_data) / len(with_data) if with_data else None


def kpi_status(value: float | None, target: float, direction: str) -> str:
    """Returns 'ok' | 'warning' | 'ko' | 'no_data' for traffic light."""
    progress = kr_progress(value, target, direction)
    if progress is None:
        return "no_data"
    if progress >= 0.95:
        return "ok"
    if progress >= 0.80:
        return "warning"
    return "ko"


def blue_money_item(
    hours_saved: float | None,
    hourly_rate: float | None,
    op_savings: float | None,
    direct_savings: float | None,
) -> float:
    """Calculate Blue Money (IT efficiency) for a single item."""
    hours_value = (hours_saved * hourly_rate) if hours_saved and hourly_rate else 0
    return hours_value + (op_savings or 0) + (direct_savings or 0)


def green_money_item(
    revenues: float | None,
    commercial_savings: float | None,
    it_attribution_pct: float | None,
) -> float:
    """Calculate Green Money (business value) for a single item."""
    return ((revenues or 0) + (commercial_savings or 0)) * (it_attribution_pct or 0)


def global_roi(
    blue_total: float, green_total: float, total_investment: float | None
) -> float | None:
    """Calculate global ROI: (value - investment) / investment."""
    if not total_investment:
        return None
    return (blue_total + green_total - total_investment) / total_investment
