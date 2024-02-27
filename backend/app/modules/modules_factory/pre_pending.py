from typing import Protocol

import app.modules.staking.proceeds.service.aggregated as aggregated
import app.modules.staking.proceeds.service.contract_balance as contract_balance
from app.shared.blockchain_types import ChainTypes, compare_blockchain_types
from app.modules.modules_factory.protocols import (
    AllUserEffectiveDeposits,
    OctantRewards,
    PendingSnapshots,
    UserEffectiveDeposits,
)
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.snapshots.pending.service.pre_pending import PrePendingSnapshots
from app.modules.user.deposits.service.calculated import CalculatedUserDeposits
from app.modules.user.events_generator.service.db_and_graph import (
    DbAndGraphEventsGenerator,
)
from app.pydantic import Model
from app.settings import config


class PrePendingUserDeposits(UserEffectiveDeposits, AllUserEffectiveDeposits, Protocol):
    pass


class PrePendingServices(Model):
    user_deposits_service: PrePendingUserDeposits
    octant_rewards_service: OctantRewards
    pending_snapshots_service: PendingSnapshots

    @staticmethod
    def create() -> "PrePendingServices":
        user_deposits = CalculatedUserDeposits(
            events_generator=DbAndGraphEventsGenerator()
        )
        current_chain_id = config.CHAIN_ID
        is_mainnet = compare_blockchain_types(current_chain_id, ChainTypes.MAINNET)

        octant_rewards = CalculatedOctantRewards(
            staking_proceeds=aggregated.AggregatedStakingProceeds()
            if is_mainnet
            else contract_balance.ContractBalanceStakingProceeds(),
            effective_deposits=user_deposits,
        )

        return PrePendingServices(
            user_deposits_service=user_deposits,
            octant_rewards_service=octant_rewards,
            pending_snapshots_service=PrePendingSnapshots(
                effective_deposits=user_deposits, octant_rewards=octant_rewards
            ),
        )
