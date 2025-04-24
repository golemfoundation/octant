from fastapi import APIRouter

from app.modules.dto import WithdrawalStatus
from v2.allocations.repositories import (
    get_user_allocations_sum_by_epoch,
    has_allocation_requests,
)
from v2.core.dependencies import GetSession
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph
from v2.project_rewards.repositories import get_by_address_and_epoch_gt
from v2.project_rewards.services import (
    get_proof,
    get_standard_merkle_tree_for_epoch_rewards,
)
from v2.user_patron_mode.repositories import get_budget_by_user_address_and_epoch
from v2.withdrawals.dependencies import GetVaultContract
from v2.withdrawals.schemas import WithdrawalsResponseV1
from v2.core.types import Address
from sqlalchemy.ext.asyncio import AsyncSession


api = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])


async def get_user_claimed_rewards(
    session: AsyncSession, user_address: Address, epoch_number: int
) -> int:
    has_allocations = await has_allocation_requests(session, user_address, epoch_number)
    if not has_allocations:
        return 0

    # If user has allocated rewards we need to subtract the allocations from the budget
    allocations_sum = await get_user_allocations_sum_by_epoch(
        session, user_address, epoch_number
    )
    budget = await get_budget_by_user_address_and_epoch(
        session, user_address, epoch_number
    )

    return budget - allocations_sum


@api.get("/{user_address}")
async def get_withdrawals(
    user_address: Address,
    session: GetSession,
    epochs_subgraph: GetEpochsSubgraph,
    epochs_contract: GetEpochsContracts,
    vault: GetVaultContract,
):
    """
    Returns a list containing amount and merkle proofs for all not claimed epochs.
    """

    last_claimed_epoch = await vault.get_last_claimed_epoch(user_address)

    rewards = await get_by_address_and_epoch_gt(
        session, user_address, last_claimed_epoch
    )
    merkle_trees = {
        r.epoch: await get_standard_merkle_tree_for_epoch_rewards(session, r.epoch)
        for r in rewards
    }
    merkle_roots_epochs = await epochs_subgraph.get_all_vault_merkle_root_epochs()

    withdrawable_eth: list[WithdrawalsResponseV1] = []

    # If there is a pending epoch, we need to add the pending epoch to the withdrawable eth
    pending_epoch_number = await epochs_contract.get_pending_epoch()
    if pending_epoch_number is not None:
        claimed_rewards = await get_user_claimed_rewards(
            session, user_address, pending_epoch_number
        )

        if claimed_rewards:
            withdrawable_eth.append(
                WithdrawalsResponseV1(
                    epoch=pending_epoch_number,
                    amount=claimed_rewards,
                    proof=[],
                    status=WithdrawalStatus.PENDING,
                )
            )

    # For all the other epochs, we need to add the withdrawable eth
    for r in rewards:
        merkle_tree = merkle_trees[r.epoch]
        status = (
            WithdrawalStatus.AVAILABLE
            if r.epoch in merkle_roots_epochs
            else WithdrawalStatus.PENDING
        )

        withdrawable_eth.append(
            WithdrawalsResponseV1(
                epoch=r.epoch,
                amount=r.amount,
                proof=get_proof(merkle_tree, user_address),
                status=status,
            )
        )

    return withdrawable_eth
