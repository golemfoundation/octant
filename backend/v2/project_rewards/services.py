from dataclasses import dataclass
from multiproof import StandardMerkleTree

from sqlalchemy.ext.asyncio import AsyncSession
from app.constants import ZERO_ADDRESS
from app.engine.octant_rewards import OctantRewardsSettings
from app.engine.user.budget import UserBudgetPayload
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.modules.dto import OctantRewardsDTO
from app.modules.octant_rewards.core import calculate_rewards
from app.exceptions import MissingAddress
from v2.core.types import Address
from v2.project_rewards.repositories import get_rewards_for_epoch
from v2.project_rewards.schemas import (
    RewardsMerkleTreeLeafV1,
    RewardsMerkleTreeResponseV1,
)
from v2.allocations.repositories import get_allocations_with_user_uqs
from v2.matched_rewards.services import MatchedRewardsEstimator
from v2.project_rewards.capped_quadratic import (
    CappedQuadraticFunding,
    capped_quadratic_funding,
)
from v2.projects.contracts import ProjectsContracts


from typing import Dict

from app.engine.user.effective_deposit import (
    DepositEvent,
    EventType,
    UserDeposit,
    UserEffectiveDepositPayload,
)
from app.engine.user.effective_deposit.weighted_average.default import (
    DefaultWeightedAverageEffectiveDeposit,
)


def calculate_effective_deposits(
    start_sec: int,
    end_sec: int,
    events: Dict[str, list[DepositEvent]],
) -> tuple[list[UserDeposit], int]:
    # TODO: We can do this better and nicer
    effective_deposit_calculator = DefaultWeightedAverageEffectiveDeposit()
    payload = UserEffectiveDepositPayload(
        epoch_start=start_sec,
        epoch_end=end_sec,
        lock_events_by_addr=events,
    )

    return effective_deposit_calculator.calculate_users_effective_deposits(payload)


def simulate_user_events(
    end_sec: int, lock_duration: int, remaining_sec: int, glm_amount: int
) -> list[DepositEvent]:
    user_events = [
        DepositEvent(
            user=ZERO_ADDRESS,
            type=EventType.LOCK,
            timestamp=end_sec - remaining_sec,
            amount=glm_amount,
            deposit_before=0,
        )
    ]
    if lock_duration < remaining_sec:
        user_events.append(
            DepositEvent(
                user=ZERO_ADDRESS,
                type=EventType.UNLOCK,
                timestamp=end_sec - remaining_sec + lock_duration,
                amount=glm_amount,
                deposit_before=glm_amount,
            )
        )
    return user_events


@dataclass
class ProjectRewardsEstimator:
    # Dependencies
    session: AsyncSession
    projects_contracts: ProjectsContracts
    matched_rewards_estimator: MatchedRewardsEstimator

    # Parameters
    epoch_number: int

    async def get(self) -> CappedQuadraticFunding:
        # Gather all the necessary data for the calculation
        all_projects = await self.projects_contracts.get_project_addresses(
            self.epoch_number
        )

        matched_rewards = await self.matched_rewards_estimator.get()

        allocations = await get_allocations_with_user_uqs(
            self.session, self.epoch_number
        )

        # Calculate using the Capped Quadratic Funding formula
        return capped_quadratic_funding(
            project_addresses=all_projects,
            allocations=allocations,
            matched_rewards=matched_rewards,
        )


async def get_standard_merkle_tree_for_epoch_rewards(
    session: AsyncSession,
    epoch_number: int,
) -> StandardMerkleTree:
    """
    Get the rewards merkle tree for a given epoch.
    """

    rewards = await get_rewards_for_epoch(session, epoch_number)

    LEAF_ENCODING: list[str] = ["address", "uint256"]
    return StandardMerkleTree.of(
        [[leaf.address, int(leaf.amount)] for leaf in rewards],
        LEAF_ENCODING,
    )


def get_proof(mt: StandardMerkleTree, address: Address) -> list[str]:
    for i, leaf in enumerate(mt.values):
        if leaf.value[0] == address:
            return mt.get_proof(i)
    raise MissingAddress(address)


async def get_rewards_merkle_tree_for_epoch(
    session: AsyncSession,
    epoch_number: int,
) -> RewardsMerkleTreeResponseV1 | None:
    """
    Get the rewards merkle tree for a given epoch.
    """

    # Merkle tree is based on rewards, so we need to get them first
    rewards = await get_rewards_for_epoch(session, epoch_number)
    if not rewards:
        return None

    # Build the merkle tree (using the leaf encoding)
    LEAF_ENCODING: list[str] = ["address", "uint256"]
    mt = StandardMerkleTree.of(
        [[leaf.address, int(leaf.amount)] for leaf in rewards],
        LEAF_ENCODING,
    )

    # Build response model
    leaves = [
        RewardsMerkleTreeLeafV1(address=leaf.value[0], amount=leaf.value[1])
        for leaf in mt.values
    ]

    rewards_sum = sum(leaf.amount for leaf in leaves)

    return RewardsMerkleTreeResponseV1(
        epoch=epoch_number,
        rewards_sum=rewards_sum,
        root=mt.root,
        leaves=leaves,
        leaf_encoding=LEAF_ENCODING,
    )


def calculate_octant_rewards(
    eth_proceeds: int,
    total_effective_deposit: int,
) -> OctantRewardsDTO:
    """
    Calculate the octant rewards based on ETH proceeds and total effective deposit.
    Proceeds are the what the octant gets from the staking.
    Effective deposit is the amount of GLMs that are eligible for rewards.

    Parameters:
        eth_proceeds: int - The amount of ETH proceeds.
        total_effective_deposit: int - The total amount of GLMs deposited.

    Returns:
        OctantRewardsDTO - The octant rewards distribution.
    """

    settings = OctantRewardsSettings()
    rewards = calculate_rewards(settings, eth_proceeds, total_effective_deposit)

    return OctantRewardsDTO(
        staking_proceeds=eth_proceeds,
        locked_ratio=rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=rewards.total_rewards,
        vanilla_individual_rewards=rewards.vanilla_individual_rewards,
        operational_cost=rewards.operational_cost,
        ppf=rewards.ppf_value,
        community_fund=rewards.community_fund,
    )


def simulate_user_effective_deposits(
    epoch_start: int,
    epoch_end: int,
    epoch_remaining: int,
    lock_duration: int,
    glm_amount: int,
) -> int:
    """
    Simulate the user effective deposits for a given epoch.
    """

    events = {
        ZERO_ADDRESS: simulate_user_events(
            epoch_end, lock_duration, epoch_remaining, glm_amount
        )
    }
    _, total_effective_deposit = calculate_effective_deposits(
        epoch_start, epoch_end, events
    )
    return total_effective_deposit


def calculate_user_budget(
    user_effective_deposit: int,
    rewards: OctantRewardsDTO,
) -> int:
    """
    Calculate the user budget based on the user effective deposit and the octant rewards.
    """

    budget_calculator = UserBudgetWithPPF()
    return budget_calculator.calculate_budget(
        UserBudgetPayload(
            user_effective_deposit=user_effective_deposit,
            total_effective_deposit=rewards.total_effective_deposit,
            vanilla_individual_rewards=rewards.vanilla_individual_rewards,
            ppf=rewards.ppf,
        )
    )
