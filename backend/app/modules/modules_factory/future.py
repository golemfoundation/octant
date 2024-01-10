from dataclasses import dataclass

from app.modules.modules_factory.protocols import OctantRewards
from app.modules.octant_rewards.service.calculated import CalculatedOctantRewards
from app.modules.staking.proceeds.service.estimated import EstimatedStakingProceeds
from app.modules.user.deposits.service.contract_balance import (
    ContractBalanceUserDeposits,
)


@dataclass(frozen=True)
class FutureServices:
    octant_rewards_service: OctantRewards

    @staticmethod
    def create() -> "FutureServices":
        return FutureServices(
            octant_rewards_service=CalculatedOctantRewards(
                staking_proceeds=EstimatedStakingProceeds(),
                effective_deposits=ContractBalanceUserDeposits(),
            )
        )
