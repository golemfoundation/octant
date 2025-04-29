from fastapi import APIRouter

from app.modules.dto import WithdrawalStatus
from v2.withdrawals.repositories import get_user_claimed_rewards
from v2.core.dependencies import GetSession
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph
from v2.project_rewards.repositories import get_by_address_and_epoch_gt
from v2.project_rewards.services import (
    get_proof,
    get_standard_merkle_tree_for_epoch_rewards,
)
from v2.withdrawals.dependencies import GetVaultContract
from v2.withdrawals.schemas import WithdrawalsResponseV1
from v2.core.types import Address


api = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])


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

    withdrawable_eth: list[WithdrawalsResponseV1] = []

    # When we are in open allocation window
    #  we add the rewards that are available to be claimed (not allocated to projects)
    pending_epoch_number = await epochs_contract.get_pending_epoch()
    print(f"pending_epoch_number: {pending_epoch_number}")
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

    # Then we need to add all the rewards that are available to be claimed
    #  from the last claimed epoch to now
    last_claimed_epoch = await vault.get_last_claimed_epoch(user_address)
    rewards = await get_by_address_and_epoch_gt(
        session, user_address, last_claimed_epoch
    )
    merkle_roots_epochs = await epochs_subgraph.get_all_vault_merkle_root_epochs()

    for r in rewards:
        status = (
            WithdrawalStatus.AVAILABLE
            if r.epoch in merkle_roots_epochs
            else WithdrawalStatus.PENDING
        )
        merkle_tree = await get_standard_merkle_tree_for_epoch_rewards(session, r.epoch)
        proof = get_proof(merkle_tree, user_address)

        withdrawable_eth.append(
            WithdrawalsResponseV1(
                epoch=r.epoch,
                amount=r.amount,
                proof=proof,
                status=status,
            )
        )

    return withdrawable_eth
