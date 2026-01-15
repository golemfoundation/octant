"""
Tests for E11 epoch settings configuration.

Tests the should_reserve_staking_for_v2() function and
EPOCHS_RESERVING_STAKING_FOR_V2 configuration.
"""

import pytest

from app.engine.epochs_settings import (
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

    def test_configuration_set_is_modifiable(self):
        """
        Configuration set can be extended for future epochs.
        This test verifies the set is mutable and can be updated.
        """
        # Make a copy to avoid affecting other tests
        original_set = EPOCHS_RESERVING_STAKING_FOR_V2.copy()

        try:
            # Test that we can add an epoch
            EPOCHS_RESERVING_STAKING_FOR_V2.add(12)
            assert 12 in EPOCHS_RESERVING_STAKING_FOR_V2
            assert should_reserve_staking_for_v2(12) is True

            # Test that we can remove an epoch
            EPOCHS_RESERVING_STAKING_FOR_V2.remove(12)
            assert 12 not in EPOCHS_RESERVING_STAKING_FOR_V2
            assert should_reserve_staking_for_v2(12) is False
        finally:
            # Restore original state
            EPOCHS_RESERVING_STAKING_FOR_V2.clear()
            EPOCHS_RESERVING_STAKING_FOR_V2.update(original_set)

    def test_negative_epoch_number(self):
        """Negative epoch numbers should not reserve staking."""
        assert should_reserve_staking_for_v2(-1) is False
        assert should_reserve_staking_for_v2(-100) is False
