from http import HTTPStatus
import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.dto import WithdrawalStatus
from v2.epochs.dependencies import (
    get_epochs_contracts,
    get_epochs_subgraph,
)
from v2.withdrawals.dependencies import get_vault_contracts
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_get_withdrawals_no_rewards(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return an empty list when user has no withdrawable rewards"""
    # === TEST SCENARIO ===
    # This test verifies that when a user has no rewards to withdraw,
    # the endpoint returns an empty list. This happens when:
    # 1. The user has not participated in any previous epochs

    # Create a user for testing
    alice = await factories.users.get_or_create_alice()

    other1, _ = await factories.users.create_random_user()
    other2, _ = await factories.users.create_random_user()
    other3, _ = await factories.users.create_random_user()

    # Create rewards for some OTHER users
    await factories.rewards.create(other1.address, 1)
    await factories.rewards.create(other2.address, 2)
    await factories.rewards.create(other2.address, 3)
    await factories.rewards.create(other3.address, 3)

    # === MOCK EXTERNAL DEPENDENCIES ===
    # The withdrawal endpoints interact with blockchain contracts and subgraphs.
    # We mock these to simulate specific conditions:

    # Vault contract - used to get the last claimed epoch for the user
    # We return 0 to simulate a user who hasn't claimed any rewards yet
    vault_contract = MagicMock()
    vault_contract.get_last_claimed_epoch = AsyncMock(return_value=0)

    # Epochs contract - used to get the current pending epoch (if any)
    # We return None to simulate that there's no active allocation window
    epochs_contract = MagicMock()
    epochs_contract.get_pending_epoch = AsyncMock(return_value=None)

    # Epochs subgraph - used to get epochs that have merkle roots set on-chain
    # We return an empty list to indicate no epochs have finalized rewards
    epochs_subgraph = MagicMock()
    epochs_subgraph.get_all_vault_merkle_root_epochs = AsyncMock(return_value=[1, 2, 3])

    # Register our mocks with FastAPI's dependency injection system
    fast_app.dependency_overrides[get_vault_contracts] = lambda: vault_contract
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: epochs_contract
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: epochs_subgraph

    # === EXECUTE THE REQUEST AND VERIFY RESULTS ===
    # Since we have:
    # - No rewards in the database for this user
    # - No pending epoch with a budget
    # - No epochs with merkle roots
    # We expect an empty list as response
    async with fast_client as client:
        resp = await client.get(f"withdrawals/{alice.address}")
        assert resp.status_code == HTTPStatus.OK
        assert resp.json() == []


@pytest.mark.asyncio
async def test_get_withdrawals_pending_claimed_rewards(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return pending claimed rewards during allocation window"""
    # === TEST SCENARIO ===
    # This test verifies that during an active allocation window, a user can see
    # their pending claimed rewards (budget - allocations).
    # These are rewards that are:
    # 1. Part of an active allocation window (pending epoch)
    # 2. Not yet allocated to projects
    # 3. Not finalized on-chain yet

    # Create a user for testing
    alice = await factories.users.get_or_create_alice()

    # === DATABASE SETUP ===
    # Create a budget entry for the user in epoch 1
    # Budget represents how much the user can allocate to projects in that epoch
    # In this test, we're simulating a budget with no allocations, so the full
    # budget amount should be available as pending claimed rewards
    budget_amount = 1_000_000_000_000_000_000  # 1 ETH in wei
    await factories.budgets.create(
        user=alice.address,
        epoch=1,
        amount=budget_amount,
    )

    await factories.allocation_requests.create(alice.address, 1)
    allocation_amount = budget_amount // 2
    await factories.allocations.create(alice, 1, amount=allocation_amount)

    other1, _ = await factories.users.create_random_user()
    other2, _ = await factories.users.create_random_user()
    other3, _ = await factories.users.create_random_user()

    # Create rewards for some OTHER users
    await factories.rewards.create(other1.address, 1)
    await factories.rewards.create(other2.address, 1)
    await factories.rewards.create(other3.address, 1)

    # === MOCK EXTERNAL DEPENDENCIES ===
    # Vault contract - used to get the last claimed epoch for the user
    # We return 0 to simulate a user who hasn't claimed any rewards yet
    vault_contract = MagicMock()
    vault_contract.get_last_claimed_epoch = AsyncMock(return_value=0)

    # Epochs contract - used to get the current pending epoch
    # We return 1 to indicate that epoch 1 is currently in the allocation window
    epochs_contract = MagicMock()
    epochs_contract.get_pending_epoch = AsyncMock(return_value=1)

    # Epochs subgraph - used to get epochs that have merkle roots set on-chain
    # We return an empty list to indicate no epochs have finalized rewards yet
    epochs_subgraph = MagicMock()
    epochs_subgraph.get_all_vault_merkle_root_epochs = AsyncMock(return_value=[])

    # Register our mocks with FastAPI's dependency injection system
    fast_app.dependency_overrides[get_vault_contracts] = lambda: vault_contract
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: epochs_contract
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: epochs_subgraph

    # === EXECUTE THE REQUEST AND VERIFY RESULTS ===
    # The endpoint should:
    # 1. Detect epoch 1 is pending (from epochs_contract)
    # 2. Query the user's budget and allocations for epoch 1
    # 3. Return the difference (claimed rewards) with PENDING status
    # 4. Include an empty proof array since pending rewards don't need proofs
    async with fast_client as client:
        resp = await client.get(f"withdrawals/{alice.address}")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert len(result) == 1
        assert result[0] == {
            "epoch": 1,
            "amount": str(allocation_amount),
            "proof": [],
            "status": WithdrawalStatus.PENDING,
        }


@pytest.mark.asyncio
async def test_get_withdrawals_available_and_pending_rewards(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return both available and pending rewards"""
    # === TEST SCENARIO ===
    # This test verifies that the endpoint correctly distinguishes between:
    # - AVAILABLE rewards: those from epochs with merkle roots published on-chain
    # - PENDING rewards: those from epochs without merkle roots yet
    # Both types are from finalized epochs (not current allocation window)

    # Create a user for testing
    alice = await factories.users.get_or_create_alice()

    # === DATABASE SETUP ===
    # Create rewards for the user - these will be stored in db and retrieved by the service
    # Unlike budgets, rewards are the finalized amounts a user receives after allocations are processed
    available_reward_amount = 1000000000000000000  # 1 ETH
    pending_reward_amount = 2000000000000000000  # 2 ETH

    # Create Alice's first reward (epoch 1)
    # This will be an AVAILABLE reward because we'll mark epoch 1 as having a merkle root
    await factories.rewards.create(
        epoch=1,
        address=alice.address,
        amount=available_reward_amount,
    )

    # Create Alice's second reward (epoch 2)
    # This will be a PENDING reward because epoch 2 won't have a merkle root yet
    await factories.rewards.create(
        epoch=2,
        address=alice.address,
        amount=pending_reward_amount,
    )

    # Add some other user to ensure the merkle tree contains multiple entries
    bob, _ = await factories.users.create_random_user()
    await factories.rewards.create(
        epoch=1,
        address=bob.address,
        amount=500000000000000000,  # 0.5 ETH
    )

    await factories.rewards.create(
        epoch=2,
        address=bob.address,
        amount=750000000000000000,  # 0.75 ETH
    )

    # === MOCK EXTERNAL DEPENDENCIES ===
    # Vault contract - return last claimed epoch 0 (user hasn't claimed any rewards)
    vault_contract = MagicMock()
    vault_contract.get_last_claimed_epoch = AsyncMock(return_value=0)

    # Epochs contract - return None for pending epoch (no active allocation window)
    epochs_contract = MagicMock()
    epochs_contract.get_pending_epoch = AsyncMock(return_value=None)

    # Epochs subgraph - return [1] to indicate epoch 1 has a merkle root on-chain
    # while epoch 2 doesn't (making epoch 1 rewards AVAILABLE, epoch 2 PENDING)
    epochs_subgraph = MagicMock()
    epochs_subgraph.get_all_vault_merkle_root_epochs = AsyncMock(return_value=[1])

    # Register our mocks with FastAPI's dependency injection system
    fast_app.dependency_overrides[get_vault_contracts] = lambda: vault_contract
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: epochs_contract
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: epochs_subgraph

    # === EXECUTE THE REQUEST AND VERIFY RESULTS ===
    # The endpoint should:
    # 1. Find rewards for epochs 1 and 2 in the database
    # 2. Check which ones have merkle roots (only epoch 1)
    # 3. Generate merkle proofs for both (since both will need them eventually)
    # 4. Mark epoch 1 as AVAILABLE and epoch 2 as PENDING
    async with fast_client as client:
        resp = await client.get(f"withdrawals/{alice.address}")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert len(result) == 2

        # Check the available reward (epoch 1)
        available_reward = next(r for r in result if r["epoch"] == 1)
        assert available_reward["amount"] == str(available_reward_amount)
        assert available_reward["proof"] != []  # Should have a real merkle proof
        assert len(available_reward["proof"]) > 0  # Verify proof exists
        assert available_reward["status"] == WithdrawalStatus.AVAILABLE

        # Check the pending reward (epoch 2)
        pending_reward = next(r for r in result if r["epoch"] == 2)
        assert pending_reward["amount"] == str(pending_reward_amount)
        assert pending_reward["proof"] != []  # Should have a real merkle proof
        assert len(pending_reward["proof"]) > 0  # Verify proof exists
        assert pending_reward["status"] == WithdrawalStatus.PENDING


@pytest.mark.asyncio
async def test_get_withdrawals_all_scenarios_combined(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should return all types of rewards: pending claimed, available, and pending unclaimed"""
    # === TEST SCENARIO ===
    # This test combines all three possible withdrawal states:
    # 1. PENDING CLAIMED: Rewards in the active allocation window
    # 2. AVAILABLE: Finalized rewards with merkle roots on-chain
    # 3. PENDING UNCLAIMED: Finalized rewards without merkle roots yet
    #
    # This is the most comprehensive test that verifies all three types
    # can be returned together correctly with the right status and proofs.

    # Create a user for testing
    alice = await factories.users.get_or_create_alice()

    # === DATABASE SETUP ===
    # 1. Create budget for the user in the pending epoch (epoch 3)
    # This represents the user's pending claimed rewards in the active allocation window
    pending_budget_amount = 3000000000000000000  # 3 ETH
    await factories.budgets.create(
        user=alice.address,
        epoch=3,
        amount=pending_budget_amount,
    )

    await factories.allocation_requests.create(alice.address, 3)
    allocation_amount = pending_budget_amount // 2
    await factories.allocations.create(alice, 3, amount=allocation_amount)

    # 2. Create rewards for past epochs
    # These are finalized rewards from previous epochs
    available_reward_amount = 1000000000000000000  # 1 ETH
    pending_reward_amount = 2000000000000000000  # 2 ETH

    # Epoch 1 reward will be AVAILABLE (has merkle root)
    await factories.rewards.create(
        epoch=1,
        address=alice.address,
        amount=available_reward_amount,
    )

    # Epoch 2 reward will be PENDING UNCLAIMED (no merkle root yet)
    await factories.rewards.create(
        epoch=2,
        address=alice.address,
        amount=pending_reward_amount,
    )

    # Add another user's rewards to make merkle tree generation realistic
    bob, _ = await factories.users.create_random_user()
    await factories.rewards.create(
        epoch=1,
        address=bob.address,
        amount=500000000000000000,  # 0.5 ETH
    )

    await factories.rewards.create(
        epoch=2,
        address=bob.address,
        amount=750000000000000000,  # 0.75 ETH
    )

    # === MOCK EXTERNAL DEPENDENCIES ===
    # Vault contract - return last claimed epoch 0 (user hasn't claimed any rewards)
    vault_contract = MagicMock()
    vault_contract.get_last_claimed_epoch = AsyncMock(return_value=0)

    # Epochs contract - return 3 to indicate epoch 3 is currently in allocation window
    epochs_contract = MagicMock()
    epochs_contract.get_pending_epoch = AsyncMock(return_value=3)

    # Epochs subgraph - return [1] to indicate only epoch 1 has a merkle root
    epochs_subgraph = MagicMock()
    epochs_subgraph.get_all_vault_merkle_root_epochs = AsyncMock(return_value=[1, 2])

    # Register our mocks with FastAPI's dependency injection system
    fast_app.dependency_overrides[get_vault_contracts] = lambda: vault_contract
    fast_app.dependency_overrides[get_epochs_contracts] = lambda: epochs_contract
    fast_app.dependency_overrides[get_epochs_subgraph] = lambda: epochs_subgraph

    # === EXECUTE THE REQUEST AND VERIFY RESULTS ===
    # The endpoint should combine all three types of withdrawals:
    # 1. Epoch 3: PENDING CLAIMED from the active allocation window
    # 2. Epoch 1: AVAILABLE with merkle proof for on-chain claim
    # 3. Epoch 2: PENDING UNCLAIMED with proof but not yet claimable on-chain
    async with fast_client as client:
        resp = await client.get(f"withdrawals/{alice.address}")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()
        assert len(result) == 3

        # Check the pending claimed reward (epoch 3)
        pending_claimed = next(r for r in result if r["epoch"] == 3)
        assert pending_claimed["amount"] == str(pending_budget_amount // 2)
        assert pending_claimed["proof"] == []  # Pending claimed rewards have no proof
        assert pending_claimed["status"] == WithdrawalStatus.PENDING

        # Check the available reward (epoch 1)
        available_reward = next(r for r in result if r["epoch"] == 1)
        assert available_reward["amount"] == str(available_reward_amount)
        assert available_reward["proof"] != []  # Should have a real merkle proof
        assert len(available_reward["proof"]) > 0  # Verify proof exists
        assert available_reward["status"] == WithdrawalStatus.AVAILABLE

        # Check the pending reward (epoch 2)
        pending_reward = next(r for r in result if r["epoch"] == 2)
        assert pending_reward["amount"] == str(pending_reward_amount)
        assert pending_reward["proof"] != []  # Should have a real merkle proof
        assert len(pending_reward["proof"]) > 0  # Verify proof exists
        assert pending_reward["status"] == WithdrawalStatus.AVAILABLE
