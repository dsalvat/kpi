import pytest

from app.services.calculations import (
    blue_money_item,
    global_roi,
    green_money_item,
    kpi_status,
    kr_annual_progress,
    kr_progress,
    objective_progress,
)


# --- kr_progress ---

class TestKrProgress:
    def test_higher_better_exact_target(self):
        assert kr_progress(95.0, 95.0, "higher_better") == 1.0

    def test_higher_better_above_target(self):
        assert kr_progress(100.0, 95.0, "higher_better") == 1.0  # capped

    def test_higher_better_below_target(self):
        assert kr_progress(47.5, 95.0, "higher_better") == 0.5

    def test_lower_better_below_target(self):
        assert kr_progress(2.0, 4.0, "lower_better") == 1.0  # 4/2=2 -> capped

    def test_lower_better_above_target(self):
        assert kr_progress(8.0, 4.0, "lower_better") == 0.5  # 4/8=0.5

    def test_lower_better_exact_target(self):
        assert kr_progress(4.0, 4.0, "lower_better") == 1.0

    def test_none_actual(self):
        assert kr_progress(None, 95.0, "higher_better") is None

    def test_zero_target(self):
        assert kr_progress(50.0, 0, "higher_better") is None

    def test_lower_better_zero_actual(self):
        assert kr_progress(0, 4.0, "lower_better") == 0.0


# --- kr_annual_progress ---

class TestKrAnnualProgress:
    def test_all_quarters(self):
        assert kr_annual_progress([0.8, 0.9, 0.95, 1.0]) == pytest.approx(0.9125)

    def test_partial_quarters(self):
        assert kr_annual_progress([0.8, 0.9, None, None]) == pytest.approx(0.85)

    def test_single_quarter(self):
        assert kr_annual_progress([0.7, None, None, None]) == pytest.approx(0.7)

    def test_no_data(self):
        assert kr_annual_progress([None, None, None, None]) is None

    def test_empty_list(self):
        assert kr_annual_progress([]) is None


# --- objective_progress ---

class TestObjectiveProgress:
    def test_all_krs_with_data(self):
        assert objective_progress([0.8, 0.9, 1.0]) == pytest.approx(0.9)

    def test_mixed_with_none(self):
        assert objective_progress([0.8, 0.9, None]) == pytest.approx(0.85)

    def test_all_none(self):
        assert objective_progress([None, None]) is None

    def test_single_kr(self):
        assert objective_progress([0.75]) == pytest.approx(0.75)


# --- kpi_status ---

class TestKpiStatus:
    def test_ok(self):
        assert kpi_status(96.0, 95.0, "higher_better") == "ok"

    def test_ok_at_boundary(self):
        # 95% of target 95 = 90.25; value 90.25/95 = 0.95 -> ok
        assert kpi_status(90.25, 95.0, "higher_better") == "ok"

    def test_warning(self):
        # 80/95 = 0.842 -> warning
        assert kpi_status(80.0, 95.0, "higher_better") == "warning"

    def test_ko(self):
        # 50/95 = 0.526 -> ko
        assert kpi_status(50.0, 95.0, "higher_better") == "ko"

    def test_no_data(self):
        assert kpi_status(None, 95.0, "higher_better") == "no_data"

    def test_lower_better_ok(self):
        # target 4, actual 3 -> 4/3 = 1.33 -> capped 1.0 -> ok
        assert kpi_status(3.0, 4.0, "lower_better") == "ok"

    def test_lower_better_ko(self):
        # target 4, actual 20 -> 4/20 = 0.2 -> ko
        assert kpi_status(20.0, 4.0, "lower_better") == "ko"


# --- blue_money_item ---

class TestBlueMoney:
    def test_all_components(self):
        # 100*45 + 2000 + 500 = 7000
        assert blue_money_item(100, 45, 2000, 500) == 7000.0

    def test_hours_only(self):
        assert blue_money_item(200, 35, 0, 0) == 7000.0

    def test_no_hours(self):
        assert blue_money_item(0, 0, 5000, 3000) == 8000.0

    def test_none_values(self):
        assert blue_money_item(None, None, 1000, None) == 1000.0

    def test_all_none(self):
        assert blue_money_item(None, None, None, None) == 0.0


# --- green_money_item ---

class TestGreenMoney:
    def test_all_components(self):
        # (100000 + 50000) * 0.3 = 45000
        assert green_money_item(100000, 50000, 0.3) == 45000.0

    def test_revenues_only(self):
        assert green_money_item(200000, 0, 0.5) == 100000.0

    def test_none_values(self):
        assert green_money_item(None, 50000, 0.2) == 10000.0

    def test_zero_attribution(self):
        assert green_money_item(100000, 50000, 0) == 0.0

    def test_all_none(self):
        assert green_money_item(None, None, None) == 0.0


# --- global_roi ---

class TestGlobalRoi:
    def test_positive_roi(self):
        # (50000+30000-60000)/60000 = 0.333
        assert global_roi(50000, 30000, 60000) == pytest.approx(0.3333, rel=1e-3)

    def test_negative_roi(self):
        # (10000+5000-60000)/60000 = -0.75
        assert global_roi(10000, 5000, 60000) == pytest.approx(-0.75)

    def test_zero_investment(self):
        assert global_roi(50000, 30000, 0) is None

    def test_none_investment(self):
        assert global_roi(50000, 30000, None) is None

    def test_breakeven(self):
        assert global_roi(30000, 30000, 60000) == pytest.approx(0.0)
