"""
Tests for calculate_staking_matched_rewards function.

This tests the calculation of the staking portion of matched rewards
that is reserved for v2 (excluding patron rewards).
"""

from decimal import Decimal

import pytest

from v2.matched_rewards.services import calculate_staking_matched_rewards


class TestCalculateStakingMatchedRewards:
    """Test suite for calculate_staking_matched_rewards function."""

    def test_locked_ratio_below_ire_percent(self):
        """
        When locked_ratio < IRE (0.35), return full matched rewards percentage.
        Formula: 0.35 * staking_proceeds
        """
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH in wei
        locked_ratio = Decimal("0.20")  # Below IRE (0.35)
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        expected = int(matched_rewards_percent * staking_proceeds)
        assert result == expected
        assert result == 350_000_000_000_000_000  # 0.35 ETH

    def test_locked_ratio_at_ire_percent(self):
        """
        When locked_ratio == IRE (0.35), use the sliding scale formula.
        Formula: (0.7 - 0.35) * staking_proceeds = 0.35 * staking_proceeds
        """
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH in wei
        locked_ratio = Decimal("0.35")  # Exactly at IRE
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        expected = int((tr_percent - locked_ratio) * staking_proceeds)
        assert result == expected
        assert result == 350_000_000_000_000_000  # 0.35 ETH

    def test_locked_ratio_between_ire_and_tr(self):
        """
        When IRE <= locked_ratio < TR, use sliding scale formula.
        Formula: (TR - locked_ratio) * staking_proceeds
        """
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH in wei
        locked_ratio = Decimal("0.5")  # Between IRE (0.35) and TR (0.7)
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        expected = int((tr_percent - locked_ratio) * staking_proceeds)
        assert result == expected
        assert result == 200_000_000_000_000_000  # 0.2 ETH

    def test_locked_ratio_just_below_tr(self):
        """
        When locked_ratio is just below TR (0.7), use sliding scale.
        Formula: (0.7 - 0.69) * staking_proceeds = 0.01 * staking_proceeds
        """
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH in wei
        locked_ratio = Decimal("0.69")  # Just below TR (0.7)
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        expected = int((tr_percent - locked_ratio) * staking_proceeds)
        assert result == expected
        assert result == 10_000_000_000_000_000  # 0.01 ETH

    def test_locked_ratio_at_tr_percent(self):
        """
        When locked_ratio == TR (0.7), return 0 (no staking contribution).
        Formula: return 0
        """
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH in wei
        locked_ratio = Decimal("0.7")  # Exactly at TR
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        assert result == 0  # No staking contribution

    def test_locked_ratio_above_tr_percent(self):
        """
        When locked_ratio > TR (0.7), return 0 (no staking contribution).
        Formula: return 0
        """
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH in wei
        locked_ratio = Decimal("0.8")  # Above TR (0.7)
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        assert result == 0  # No staking contribution

    def test_with_large_staking_proceeds(self):
        """Test with realistic large staking proceeds."""
        staking_proceeds = 500_000_000_000_000_000_000  # 500 ETH in wei
        locked_ratio = Decimal("0.42")  # Between IRE and TR
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        # (0.7 - 0.42) * 500 = 0.28 * 500 = 140 ETH
        expected = int((tr_percent - locked_ratio) * staking_proceeds)
        assert result == expected
        assert result == 140_000_000_000_000_000_000  # 140 ETH

    def test_with_zero_staking_proceeds(self):
        """Test edge case with zero staking proceeds."""
        staking_proceeds = 0
        locked_ratio = Decimal("0.5")
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        assert result == 0

    def test_with_very_small_locked_ratio(self):
        """Test with very small locked ratio."""
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH
        locked_ratio = Decimal("0.01")  # Very small
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        # Should use full matched rewards percent
        expected = int(matched_rewards_percent * staking_proceeds)
        assert result == expected
        assert result == 350_000_000_000_000_000  # 0.35 ETH

    def test_default_parameters(self):
        """Test that default parameters work correctly."""
        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH
        locked_ratio = Decimal("0.5")

        result = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            # Using default parameters
        )

        # Defaults: IRE=0.35, TR=0.7, matched_rewards_percent=0.35
        # locked_ratio=0.5 is between IRE and TR
        # Formula: (0.7 - 0.5) * 1 ETH = 0.2 ETH
        assert result == 200_000_000_000_000_000

    def test_patron_rewards_not_included(self):
        """
        Verify that this function only returns staking portion,
        NOT including patron rewards (compare with _calculate_percentage_matched_rewards).
        """
        from v2.matched_rewards.services import _calculate_percentage_matched_rewards

        staking_proceeds = 1_000_000_000_000_000_000  # 1 ETH
        locked_ratio = Decimal("0.5")
        patron_rewards = 500_000_000_000_000_000  # 0.5 ETH
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        # Staking portion only (no patron rewards)
        staking_only = calculate_staking_matched_rewards(
            staking_proceeds=staking_proceeds,
            locked_ratio=locked_ratio,
            ire_percent=ire_percent,
            tr_percent=tr_percent,
            matched_rewards_percent=matched_rewards_percent,
        )

        # Total matched rewards (includes patron rewards)
        total_matched = _calculate_percentage_matched_rewards(
            locked_ratio=locked_ratio,
            tr_percent=tr_percent,
            ire_percent=ire_percent,
            staking_proceeds=staking_proceeds,
            patrons_rewards=patron_rewards,
            matched_rewards_percent=matched_rewards_percent,
        )

        # Verify staking portion + patron rewards = total matched
        assert staking_only + patron_rewards == total_matched
        assert staking_only == 200_000_000_000_000_000  # 0.2 ETH (staking only)
        assert total_matched == 700_000_000_000_000_000  # 0.7 ETH (0.2 + 0.5)
