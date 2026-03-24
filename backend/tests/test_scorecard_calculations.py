"""TDD tests for scorecard calculation functions.

Written BEFORE implementation (Red → Green → Refactor).
"""

import uuid
import pytest
from app.services.calculations import (
    indicator_progress,
    category_score,
    scorecard_score,
)


# ══════════════════════════════════════════════════════════
# indicator_progress
# ══════════════════════════════════════════════════════════

class TestIndicatorProgress:
    """Progress of a single scorecard indicator."""

    # --- continuous (higher_better) ---
    def test_continuous_exact_target(self):
        assert indicator_progress(99.7, 99.7, "higher_better", "continuous") == 1.0

    def test_continuous_above_target(self):
        assert indicator_progress(100.0, 99.7, "higher_better", "continuous") == 1.0

    def test_continuous_below_target(self):
        result = indicator_progress(95.0, 99.7, "higher_better", "continuous")
        assert result == pytest.approx(95.0 / 99.7, rel=1e-4)

    def test_continuous_zero_value(self):
        assert indicator_progress(0.0, 99.7, "higher_better", "continuous") == 0.0

    # --- continuous (lower_better) ---
    def test_continuous_lower_better_exact(self):
        assert indicator_progress(2.0, 2.0, "lower_better", "continuous") == 1.0

    def test_continuous_lower_better_below_target(self):
        """Below target is BETTER for lower_better (e.g., MTTR < 5h, actual 3h)."""
        assert indicator_progress(3.0, 5.0, "lower_better", "continuous") == 1.0

    def test_continuous_lower_better_above_target(self):
        """Above target is WORSE for lower_better."""
        result = indicator_progress(8.0, 5.0, "lower_better", "continuous")
        assert result == pytest.approx(5.0 / 8.0, rel=1e-4)

    # --- binary ---
    def test_binary_complete(self):
        assert indicator_progress(100.0, 100.0, "higher_better", "binary") == 1.0

    def test_binary_incomplete(self):
        assert indicator_progress(50.0, 100.0, "higher_better", "binary") == 0.5

    def test_binary_zero(self):
        assert indicator_progress(0.0, 100.0, "higher_better", "binary") == 0.0

    # --- count ---
    def test_count_type_uses_continuous_logic(self):
        """Count indicators use the same progress logic as continuous."""
        result = indicator_progress(150, 200, "higher_better", "count")
        assert result == pytest.approx(150 / 200, rel=1e-4)

    def test_count_above_target(self):
        assert indicator_progress(250, 200, "higher_better", "count") == 1.0

    # --- edge cases ---
    def test_none_value(self):
        assert indicator_progress(None, 100.0, "higher_better", "continuous") is None

    def test_zero_target(self):
        assert indicator_progress(50.0, 0, "higher_better", "continuous") is None


# ══════════════════════════════════════════════════════════
# category_score
# ══════════════════════════════════════════════════════════

class TestCategoryScore:
    """Weighted score for a category (operational or management)."""

    def test_all_indicators_at_target(self):
        indicators = [
            {"progress": 1.0, "weight_pct": 16.67},
            {"progress": 1.0, "weight_pct": 16.67},
            {"progress": 1.0, "weight_pct": 16.67},
        ]
        assert category_score(indicators) == pytest.approx(1.0, rel=1e-4)

    def test_mixed_progress(self):
        indicators = [
            {"progress": 1.0, "weight_pct": 16.67},
            {"progress": 0.5, "weight_pct": 16.67},
            {"progress": 0.8, "weight_pct": 16.67},
        ]
        expected = (1.0 * 16.67 + 0.5 * 16.67 + 0.8 * 16.67) / (16.67 * 3)
        assert category_score(indicators) == pytest.approx(expected, rel=1e-4)

    def test_unequal_weights(self):
        """Data team has 4 operational indicators at 12.50% each."""
        indicators = [
            {"progress": 1.0, "weight_pct": 12.50},
            {"progress": 0.9, "weight_pct": 12.50},
            {"progress": 0.8, "weight_pct": 12.50},
            {"progress": 0.7, "weight_pct": 12.50},
        ]
        expected = (1.0 * 12.5 + 0.9 * 12.5 + 0.8 * 12.5 + 0.7 * 12.5) / (12.5 * 4)
        assert category_score(indicators) == pytest.approx(expected, rel=1e-4)

    def test_some_none_progress(self):
        """Indicators without data are excluded from weighted average."""
        indicators = [
            {"progress": 1.0, "weight_pct": 16.67},
            {"progress": None, "weight_pct": 16.67},
            {"progress": 0.6, "weight_pct": 16.67},
        ]
        expected = (1.0 * 16.67 + 0.6 * 16.67) / (16.67 * 2)
        assert category_score(indicators) == pytest.approx(expected, rel=1e-4)

    def test_all_none(self):
        indicators = [
            {"progress": None, "weight_pct": 16.67},
            {"progress": None, "weight_pct": 16.67},
        ]
        assert category_score(indicators) is None

    def test_empty_list(self):
        assert category_score([]) is None

    def test_single_indicator(self):
        indicators = [{"progress": 0.75, "weight_pct": 50.0}]
        assert category_score(indicators) == pytest.approx(0.75, rel=1e-4)


# ══════════════════════════════════════════════════════════
# scorecard_score
# ══════════════════════════════════════════════════════════

class TestScorecardScore:
    """Overall scorecard score from operational + management categories."""

    def test_balanced_50_50(self):
        result = scorecard_score(0.8, 0.6, 50.0, 50.0)
        assert result == pytest.approx(0.7, rel=1e-4)

    def test_perfect_score(self):
        assert scorecard_score(1.0, 1.0, 50.0, 50.0) == pytest.approx(1.0, rel=1e-4)

    def test_custom_weights(self):
        """If weights were 60/40 instead of 50/50."""
        result = scorecard_score(0.8, 0.6, 60.0, 40.0)
        expected = (0.8 * 60.0 + 0.6 * 40.0) / (60.0 + 40.0)
        assert result == pytest.approx(expected, rel=1e-4)

    def test_operational_only(self):
        """Management has no data yet."""
        result = scorecard_score(0.85, None, 50.0, 50.0)
        assert result == pytest.approx(0.85, rel=1e-4)

    def test_management_only(self):
        result = scorecard_score(None, 0.72, 50.0, 50.0)
        assert result == pytest.approx(0.72, rel=1e-4)

    def test_both_none(self):
        assert scorecard_score(None, None, 50.0, 50.0) is None

    def test_zero_scores(self):
        assert scorecard_score(0.0, 0.0, 50.0, 50.0) == pytest.approx(0.0, rel=1e-4)
