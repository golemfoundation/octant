"""
Tests for E11 epoch settings configuration.

Tests the should_reserve_staking_for_v2() function and
EPOCHS_RESERVING_STAKING_FOR_V2 configuration.
"""

import pytest

from v2.matched_rewards.services import (
    should_reserve_staking_for_v2,
    EPOCHS_RESERVING_STAKING_FOR_V2,
)


class TestEpochStakingReservationConfig:
    """Test suite for epoch staking reservation configuration."""

    def test_e11_should_reserve_staking(self):
        """E11 should be configured to reserve staking for v2."""
        assert should_reserve_staking_for_v2(11) is True

    def test_standard_epochs_should_not_reserve_staking(self):
        """Standard epochs (1-10) should not reserve staking."""
        for epoch in range(1, 11):
            assert (
                should_reserve_staking_for_v2(epoch) is False
            ), f"Epoch {epoch} should not reserve staking"

    def test_future_epochs_default_to_not_reserving(self):
        """Future epochs (12+) should not reserve staking by default."""
        for epoch in [12, 13, 14, 15, 20, 50, 100]:
            assert (
                should_reserve_staking_for_v2(epoch) is False
            ), f"Epoch {epoch} should not reserve staking by default"

    def test_epoch_zero_does_not_reserve(self):
        """Epoch 0 should not reserve staking."""
        assert should_reserve_staking_for_v2(0) is False

    def test_configuration_set_contains_e11(self):
        """EPOCHS_RESERVING_STAKING_FOR_V2 set should contain 11."""
        assert 11 in EPOCHS_RESERVING_STAKING_FOR_V2

    def test_negative_epoch_number(self):
        """Negative epoch numbers should not reserve staking."""
        assert should_reserve_staking_for_v2(-1) is False
        assert should_reserve_staking_for_v2(-100) is False
