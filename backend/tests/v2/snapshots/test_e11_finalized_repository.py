"""
Tests for E11 finalized snapshot repository operations.

Tests that the staking_matched_reserved_for_v2 field is properly
saved and retrieved from the database.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from tests.v2.factories import FactoriesAggregator
from v2.snapshots.repositories import (
    get_finalized_epoch_snapshot,
    save_finalized_snapshot,
)
from v2.snapshots.schemas import (
    FinalizedSnapshotResponseV1,
    ProjectRewardsV1,
    UserRewardsV1,
)


@pytest.mark.asyncio
async def test_save_and_retrieve_e11_snapshot_with_staking_reservation(
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that staking_matched_reserved_for_v2 field is properly saved and retrieved.
    """
    epoch_number = 11

    # Create a finalized snapshot response with staking reservation
    finalized_snapshot = FinalizedSnapshotResponseV1(
        patrons_rewards=150_000,
        matched_rewards=150_000,  # For E11, matches patron rewards
        projects_rewards=[
            ProjectRewardsV1(
                address="0x1234567890123456789012345678901234567890",
                amount=100_000,
                matched=50_000,
            ),
        ],
        user_rewards=[
            UserRewardsV1(
                address="0x2234567890123456789012345678901234567890",
                amount=25_000,
            ),
        ],
        total_withdrawals=125_000,
        leftover=75_000,
        merkle_root="0xabcdef1234567890",
        staking_matched_reserved_for_v2=200_000,  # Reserved for v2
    )

    # Save to database
    await save_finalized_snapshot(fast_session, epoch_number, finalized_snapshot)
    await fast_session.commit()

    # Retrieve from database
    retrieved_snapshot = await get_finalized_epoch_snapshot(fast_session, epoch_number)

    # Verify all fields including the new one
    assert retrieved_snapshot is not None
    assert retrieved_snapshot.epoch == epoch_number
    assert int(retrieved_snapshot.patrons_rewards) == 150_000
    assert int(retrieved_snapshot.matched_rewards) == 150_000
    assert int(retrieved_snapshot.total_withdrawals) == 125_000
    assert int(retrieved_snapshot.leftover) == 75_000
    assert retrieved_snapshot.withdrawals_merkle_root == "0xabcdef1234567890"
    assert (
        int(retrieved_snapshot.staking_matched_reserved_for_v2) == 200_000
    ), "Staking reserved field should be saved"


@pytest.mark.asyncio
async def test_save_standard_epoch_snapshot_with_zero_reservation(
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that standard epochs (not E11) save staking_matched_reserved_for_v2 as 0.
    """
    epoch_number = 10  # Standard epoch

    # Create a finalized snapshot for standard epoch
    finalized_snapshot = FinalizedSnapshotResponseV1(
        patrons_rewards=100_000,
        matched_rewards=350_000,  # Includes staking + patron rewards
        projects_rewards=[
            ProjectRewardsV1(
                address="0x1234567890123456789012345678901234567890",
                amount=200_000,
                matched=100_000,
            ),
        ],
        user_rewards=[],
        total_withdrawals=200_000,
        leftover=50_000,
        merkle_root="0xdef1234567890abc",
        staking_matched_reserved_for_v2=0,  # No reservation for standard epochs
    )

    # Save to database
    await save_finalized_snapshot(fast_session, epoch_number, finalized_snapshot)
    await fast_session.commit()

    # Retrieve from database
    retrieved_snapshot = await get_finalized_epoch_snapshot(fast_session, epoch_number)

    # Verify staking reserved is 0
    assert retrieved_snapshot is not None
    assert retrieved_snapshot.epoch == epoch_number
    assert (
        int(retrieved_snapshot.staking_matched_reserved_for_v2) == 0
    ), "Standard epochs should have 0 staking reservation"
    assert int(retrieved_snapshot.matched_rewards) == 350_000


@pytest.mark.asyncio
async def test_finalized_snapshot_default_value_for_staking_reserved(
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that staking_matched_reserved_for_v2 defaults to 0 when not explicitly set.
    """
    epoch_number = 9

    # Create a finalized snapshot without explicitly setting staking_matched_reserved_for_v2
    # (relying on default value)
    finalized_snapshot = FinalizedSnapshotResponseV1(
        patrons_rewards=80_000,
        matched_rewards=280_000,
        projects_rewards=[],
        user_rewards=[],
        total_withdrawals=0,
        leftover=100_000,
        merkle_root=None,
        # staking_matched_reserved_for_v2 not set, should default to 0
    )

    # Save to database
    await save_finalized_snapshot(fast_session, epoch_number, finalized_snapshot)
    await fast_session.commit()

    # Retrieve from database
    retrieved_snapshot = await get_finalized_epoch_snapshot(fast_session, epoch_number)

    # Verify default value
    assert retrieved_snapshot is not None
    assert (
        int(retrieved_snapshot.staking_matched_reserved_for_v2) == 0
    ), "Should default to 0 when not set"


@pytest.mark.asyncio
async def test_large_staking_reservation_value(
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that large values for staking_matched_reserved_for_v2 are handled correctly.
    """
    epoch_number = 11

    # Create snapshot with a large realistic value (e.g., 100 ETH in wei)
    large_staking_amount = 100_000_000_000_000_000_000  # 100 ETH in wei

    finalized_snapshot = FinalizedSnapshotResponseV1(
        patrons_rewards=50_000_000_000_000_000_000,  # 50 ETH
        matched_rewards=50_000_000_000_000_000_000,  # Matches patron rewards for E11
        projects_rewards=[],
        user_rewards=[],
        total_withdrawals=0,
        leftover=200_000_000_000_000_000_000,
        merkle_root=None,
        staking_matched_reserved_for_v2=large_staking_amount,
    )

    # Save to database
    await save_finalized_snapshot(fast_session, epoch_number, finalized_snapshot)
    await fast_session.commit()

    # Retrieve from database
    retrieved_snapshot = await get_finalized_epoch_snapshot(fast_session, epoch_number)

    # Verify large value is stored correctly
    assert retrieved_snapshot is not None
    assert (
        int(retrieved_snapshot.staking_matched_reserved_for_v2) == large_staking_amount
    ), "Large values should be stored correctly"


@pytest.mark.asyncio
async def test_multiple_epochs_with_different_staking_reservations(
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that multiple epochs can have different staking reservation values.
    """
    # Create snapshots for multiple epochs
    epochs_data = [
        (9, 0),  # Standard epoch, no reservation
        (10, 0),  # Standard epoch, no reservation
        (11, 150_000),  # E11, has reservation
        (12, 0),  # Future epoch, no reservation (if it uses standard logic)
    ]

    for epoch_num, expected_reservation in epochs_data:
        finalized_snapshot = FinalizedSnapshotResponseV1(
            patrons_rewards=100_000,
            matched_rewards=200_000,
            projects_rewards=[],
            user_rewards=[],
            total_withdrawals=0,
            leftover=50_000,
            merkle_root=None,
            staking_matched_reserved_for_v2=expected_reservation,
        )

        await save_finalized_snapshot(fast_session, epoch_num, finalized_snapshot)

    await fast_session.commit()

    # Verify each epoch independently
    for epoch_num, expected_reservation in epochs_data:
        retrieved = await get_finalized_epoch_snapshot(fast_session, epoch_num)
        assert retrieved is not None
        assert retrieved.epoch == epoch_num
        assert (
            int(retrieved.staking_matched_reserved_for_v2) == expected_reservation
        ), f"Epoch {epoch_num} should have reservation {expected_reservation}"
