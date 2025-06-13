import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from v2.glms.dependencies import get_glm_balance_of_deposits
from tests.v2.factories import FactoriesAggregator
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from tests.v2.fake_contracts.conftest import FakeEpochsContractCallable
from fastapi import FastAPI


@pytest.mark.asyncio
async def test_estimates_budget_for_single_epoch(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should correctly estimate budget for a single epoch deposit
    We are testing this while in finalized epoch.
    """
    # Given
    glm_amount = 1000 * 10**18  # 1000 GLM
    epoch_duration = 90 * 24 * 60 * 60  # 90 days in seconds
    epoch_start = 1000
    finalized_epoch = 1
    glm_balance = 5000 * 10**18  # 5000 GLM total in contract

    # Mock contracts
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            finalized_epoch=finalized_epoch,
            current_epoch=finalized_epoch + 1,
            pending_epoch=None,
            future_epoch_props=(0, 0, epoch_start, epoch_duration),
        )
    )

    # Create pending epoch snapshot
    await factories.pending_snapshots.create(epoch=finalized_epoch)

    # finalize epoch snapshot
    await factories.finalized_snapshots.create(
        epoch=finalized_epoch,
    )

    # Mock GLM balance
    fast_app.dependency_overrides[get_glm_balance_of_deposits] = lambda: glm_balance

    # Mock matched rewards estimator
    # rewards_estimator_mock = MagicMock(spec=MatchedRewardsEstimator)
    # rewards_estimator_mock.get.return_value = leverage
    # fast_app.dependency_overrides[get_matched_rewards_estimator] = lambda: rewards_estimator_mock

    request_data = {"glm_amount": str(glm_amount), "number_of_epochs": 1}

    async with fast_client as client:
        resp = await client.post("/rewards/estimated_budget", json=request_data)

        assert resp.status_code == 200
        response = resp.json()
        assert response["budget"] != "0"
        assert response["matchedFunding"] == "0"


@pytest.mark.asyncio
async def test_estimates_budget_for_multiple_epochs(
    fake_epochs_contract_factory: FakeEpochsContractCallable,
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """Should correctly estimate budget for multiple epochs"""
    # Given
    glm_amount = 1000 * 10**18
    number_of_epochs = 1
    epoch_duration = 90 * 24 * 60 * 60
    epoch_start = 1000
    finalized_epoch = 1
    glm_balance = 5000 * 10**18

    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    alice_allocation = await factories.allocations.create(
        user=alice,
        epoch=finalized_epoch,
    )
    bob_allocation = await factories.allocations.create(
        user=bob,
        epoch=finalized_epoch,
    )

    # Create pending epoch snapshot
    await factories.pending_snapshots.create(epoch=finalized_epoch)

    # finalize epoch snapshot
    finalized_snapshot = await factories.finalized_snapshots.create(
        epoch=finalized_epoch,
    )

    # Mock contracts
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            finalized_epoch=finalized_epoch,
            future_epoch_props=(0, 0, epoch_start, epoch_duration),
        )
    )

    # Mock dependencies
    fast_app.dependency_overrides[get_glm_balance_of_deposits] = lambda: glm_balance

    # Mock matched rewards estimator
    # rewards_estimator_mock = MagicMock(spec=GetMatchedRewardsEstimatorInAW)
    # rewards_estimator_mock.get.return_value = leverage
    # fast_app.dependency_overrides[GetMatchedRewardsEstimatorInAW] = lambda: rewards_estimator_mock

    request_data = {"glm_amount": str(glm_amount), "number_of_epochs": number_of_epochs}

    async with fast_client as client:
        resp = await client.post("/rewards/estimated_budget", json=request_data)

        assert resp.status_code == 200
        result = resp.json()

        assert result["budget"] != "0"
        assert result["matchedFunding"] != "0"
        leverage = int(finalized_snapshot.matched_rewards) / (
            int(alice_allocation.amount) + int(bob_allocation.amount)
        )
        assert int(result["matchedFunding"]) == int(int(result["budget"]) * leverage)

        one_epoch_budget = int(result["budget"])
        one_epoch_matched_funding = int(result["matchedFunding"])

        # Test two epochs
        request_data = {"glm_amount": str(glm_amount), "number_of_epochs": 2}

        resp = await client.post("/rewards/estimated_budget", json=request_data)

        assert resp.status_code == 200
        result = resp.json()
        assert int(result["budget"]) != "0"
        assert int(result["matchedFunding"]) != "0"

        assert int(result["budget"]) == one_epoch_budget * 2
        assert int(result["matchedFunding"]) == one_epoch_matched_funding * 2

        # Test zero GLM amount
        request_data = {"glm_amount": str(0), "number_of_epochs": 1}

        resp = await client.post("/rewards/estimated_budget", json=request_data)

        assert resp.status_code == 200
        result = resp.json()
        assert int(result["budget"]) == 0
        assert int(result["matchedFunding"]) == 0


@pytest.mark.asyncio
async def test_validates_request_parameters(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    fake_epochs_contract_factory: FakeEpochsContractCallable,
):
    """Should validate request parameters"""

    # Mock contracts
    fake_epochs_contract_factory(
        FakeEpochsContractDetails(
            finalized_epoch=1,
            future_epoch_props=(0, 0, 1000000, 10000),
        )
    )
    fast_app.dependency_overrides[get_glm_balance_of_deposits] = lambda: 5000 * 10**18

    async with fast_client as client:
        # Test negative GLM amount
        resp = await client.post(
            "/rewards/estimated_budget",
            json={"glm_amount": "-1000", "number_of_epochs": 1},
        )
        assert resp.status_code == 422

        # Test zero epochs
        resp = await client.post(
            "/rewards/estimated_budget",
            json={"glm_amount": "1000", "number_of_epochs": 0},
        )
        assert resp.status_code == 422

        # Test negative epochs
        resp = await client.post(
            "/rewards/estimated_budget",
            json={"glm_amount": "1000", "number_of_epochs": -1},
        )
        assert resp.status_code == 422
