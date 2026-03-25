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


# ══════════════════════════════════════════════════════════
# KPI → OKR quarterly aggregation
# ══════════════════════════════════════════════════════════


def quarter_months(quarter: int) -> tuple[int, int, int]:
    """Return the 3 month numbers for a given quarter (1-4)."""
    start = (quarter - 1) * 3 + 1
    return (start, start + 1, start + 2)


def aggregate_kpi_quarterly(
    monthly_values: list[tuple[int, float]],
    quarter: int,
    aggregation: str,
) -> float | None:
    """Aggregate KPI monthly values into a quarterly actual.

    monthly_values: list of (month, value) tuples for a given year.
    quarter: 1-4.
    aggregation: 'avg_quarter' or 'sum_cumulative'.
    Returns None if no monthly values exist for that quarter or unknown aggregation.
    """
    months = set(quarter_months(quarter))
    in_quarter = [v for m, v in monthly_values if m in months]
    if not in_quarter:
        return None
    if aggregation == "avg_quarter":
        return sum(in_quarter) / len(in_quarter)
    if aggregation == "sum_cumulative":
        return sum(in_quarter)
    return None


# ══════════════════════════════════════════════════════════
# Scorecard calculations
# ══════════════════════════════════════════════════════════


def indicator_progress(
    value: float | None,
    target: float,
    direction: str,
    indicator_type: str,
) -> float | None:
    """Progress of a single scorecard indicator.

    - continuous/count: same as kr_progress (capped at 1.0)
    - binary: linear progress value/target (0.0 to 1.0)
    """
    if value is None or target == 0:
        return None
    if indicator_type == "binary":
        return min(1.0, value / target)
    return kr_progress(value, target, direction)


def category_score(
    indicators: list[dict],
) -> float | None:
    """Weighted average score for a category (operational or management).

    Each indicator dict must have 'progress' (float|None) and 'weight_pct' (float).
    Indicators with progress=None are excluded; their weight is redistributed.
    """
    with_data = [(i["progress"], i["weight_pct"]) for i in indicators if i["progress"] is not None]
    if not with_data:
        return None
    total_weight = sum(w for _, w in with_data)
    if total_weight == 0:
        return None
    return sum(p * w for p, w in with_data) / total_weight


def scorecard_score(
    operational: float | None,
    management: float | None,
    op_weight: float = 50.0,
    mgmt_weight: float = 50.0,
) -> float | None:
    """Overall scorecard score from operational + management categories."""
    scores = []
    if operational is not None:
        scores.append((operational, op_weight))
    if management is not None:
        scores.append((management, mgmt_weight))
    if not scores:
        return None
    total_weight = sum(w for _, w in scores)
    if total_weight == 0:
        return None
    return sum(s * w for s, w in scores) / total_weight
