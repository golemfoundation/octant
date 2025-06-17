"""
Withdrawal management endpoints.

This module provides endpoints for managing user reward withdrawals, including:
- Retrieving available withdrawals
- Generating merkle proofs for verification
- Tracking withdrawal status

Key Concepts:
    - Withdrawal Status:
        - PENDING: Rewards not yet finalized (during allocation window)
        - AVAILABLE: Rewards finalized and ready for withdrawal
        - CLAIMED: Rewards already withdrawn

    - Withdrawal Process:
        - Rewards become available after epoch finalization
        - Merkle proofs required for verification
        - Can withdraw from multiple epochs
        - Tracks last claimed epoch

    - Reward Sources:
        - Unallocated rewards from current epoch
        - Finalized rewards from past epochs
        - Project rewards with merkle proofs

    - Merkle Verification:
        - Proofs generated for each withdrawal
        - Verifies reward eligibility
        - Prevents double-claiming
        - Root stored on-chain
"""

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
) -> list[WithdrawalsResponseV1]:
    """
    Get list of available withdrawals for a user.

    This endpoint returns all unclaimed rewards for a user, including:
    1. Pending rewards from the current allocation window
    2. Available rewards from finalized epochs
    3. Merkle proofs for verification

    The response includes:
    - Epoch number
    - Withdrawal amount
    - Merkle proof (if available)
    - Withdrawal status

    Args:
        user_address: The user's Ethereum address

    Returns:
        list[WithdrawalsResponseV1]: List of available withdrawals with:
            - epoch: The epoch number
            - amount: The withdrawal amount
            - proof: Merkle proof for verification
            - status: PENDING or AVAILABLE

    Note:
        - PENDING status for current epoch rewards
        - AVAILABLE status for finalized epochs
        - Empty proof for pending rewards
        - Merkle proof required for available rewards
        - Tracks last claimed epoch to prevent double-claiming
    """

    withdrawable_eth: list[WithdrawalsResponseV1] = []

    # When we are in open allocation window
    #  we add the rewards that are available to be claimed (not allocated to projects)
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
