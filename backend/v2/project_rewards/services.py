from dataclasses import dataclass
from multiproof import StandardMerkleTree

from sqlalchemy.ext.asyncio import AsyncSession
from v2.project_rewards.repositories import get_rewards_for_epoch
from v2.project_rewards.schemas import (
    RewardsMerkleTreeLeafV1,
    RewardsMerkleTreeResponseV1,
)
from v2.allocations.repositories import get_allocations_with_user_uqs
from v2.matched_rewards.services import MatchedRewardsEstimator
from v2.project_rewards.capped_quadriatic import (
    CappedQuadriaticFunding,
    capped_quadriatic_funding,
)
from v2.projects.contracts import ProjectsContracts


@dataclass
class ProjectRewardsEstimator:
    # Dependencies
    session: AsyncSession
    projects_contracts: ProjectsContracts
    matched_rewards_estimator: MatchedRewardsEstimator

    # Parameters
    epoch_number: int

    async def get(self) -> CappedQuadriaticFunding:
        # Gather all the necessary data for the calculation
        all_projects = await self.projects_contracts.get_project_addresses(
            self.epoch_number
        )

        matched_rewards = await self.matched_rewards_estimator.get()

        allocations = await get_allocations_with_user_uqs(
            self.session, self.epoch_number
        )

        # Calculate using the Capped Quadratic Funding formula
        return capped_quadriatic_funding(
            project_addresses=all_projects,
            allocations=allocations,
            matched_rewards=matched_rewards,
        )


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
