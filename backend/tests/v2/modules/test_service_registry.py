import pytest
from app.v2.context.epoch_state import EpochState
from app.v2.modules.octant_rewards.service.impl.calculated import (
    CalculatedOctantRewards,
)
from app.v2.modules.octant_rewards.service.impl.saved import SavedOctantRewards
from app.v2.modules.registry import register_services, get_services
from app.v2.modules.snapshots.pending.service.impl.pre_pending import (
    PrePendingSnapshots,
)
from app.v2.modules.staking.proceeds.service.impl.contract_balance import (
    ContractBalanceStakingProceeds,
)
from app.v2.modules.staking.proceeds.service.impl.estimated import (
    EstimatedStakingProceeds,
)
from app.v2.modules.staking.proceeds.service.impl.saved import SavedStakingProceeds
from app.v2.modules.user.deposits.service.impl.calculated import CalculatedUserDeposits
from app.v2.modules.user.deposits.service.impl.contract_balance import (
    ContractBalanceUserDeposits,
)
from app.v2.modules.user.deposits.service.impl.saved import SavedUserDeposits
from app.v2.modules.user.events_generator.service.impl.db_and_graph import (
    DbAndGraphEventsGenerator,
)


@pytest.mark.parametrize(
    "state, user_deposits, staking_proceeds, octant_rewards, snapshots",
    [
        (
            EpochState.FUTURE,
            ContractBalanceUserDeposits(),
            EstimatedStakingProceeds(),
            CalculatedOctantRewards(
                EstimatedStakingProceeds(), ContractBalanceUserDeposits()
            ),
            None,
        ),
        (
            EpochState.CURRENT,
            CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            EstimatedStakingProceeds(),
            CalculatedOctantRewards(
                EstimatedStakingProceeds(),
                CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            ),
            None,
        ),
        (
            EpochState.PRE_PENDING,
            CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            ContractBalanceStakingProceeds(),
            CalculatedOctantRewards(
                ContractBalanceStakingProceeds(),
                CalculatedUserDeposits(DbAndGraphEventsGenerator()),
            ),
            PrePendingSnapshots(CalculatedUserDeposits(DbAndGraphEventsGenerator())),
        ),
        (
            EpochState.PENDING,
            SavedUserDeposits(),
            SavedStakingProceeds(),
            SavedOctantRewards(),
            None,
        ),
        (
            EpochState.FINALIZING,
            SavedUserDeposits(),
            SavedStakingProceeds(),
            SavedOctantRewards(),
            None,
        ),
        (
            EpochState.FINALIZED,
            SavedUserDeposits(),
            SavedStakingProceeds(),
            SavedOctantRewards(),
            None,
        ),
    ],
)
def test_service_registry(
    state,
    user_deposits,
    staking_proceeds,
    octant_rewards,
    snapshots,
):
    register_services()

    result = get_services(state)

    assert result.user_deposits_service == user_deposits
    assert result.staking_proceeds_service == staking_proceeds
    assert result.octant_rewards_service == octant_rewards
    assert result.snapshots_service == snapshots
