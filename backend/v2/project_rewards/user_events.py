

from itertools import groupby
from operator import attrgetter
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Dict

from app.engine.octant_rewards import OctantRewardsSettings
from app.engine.user.budget.with_ppf import UserBudgetWithPPF
from app.engine.user.effective_deposit import DepositEvent, EventType, UserDeposit, UserEffectiveDepositPayload
from app.engine.user.effective_deposit.weighted_average.default_with_sablier_timebox import DefaultWeightedAverageWithSablierTimebox
from app.infrastructure.database.models import Deposit
from app.infrastructure.graphql.locks import get_locks_by_timestamp_range
from app.infrastructure.graphql.unlocks import get_unlocks_by_timestamp_range
from app.modules.common.sablier_events_mapper import FlattenStrategy, flatten_sablier_events, process_to_locks_and_unlocks
from app.modules.dto import OctantRewardsDTO, PendingSnapshotDTO
from app.modules.octant_rewards.core import calculate_rewards
from app.modules.snapshots.pending.core import calculate_user_budgets
from app.modules.user.budgets.core import get_upcoming_budget
from app.modules.user.events_generator.core import unify_deposit_balances
from app.modules.staking.proceeds.core import estimate_staking_proceeds
from app.constants import SABLIER_SENDER_ADDRESS_SEPOLIA, SABLIER_TOKEN_ADDRESS_SEPOLIA, ZERO_ADDRESS
from app.infrastructure import SubgraphEndpoints
from v2.deposits.repositories import DepositEventsRepository
from v2.epochs.subgraphs import EpochsSubgraph
from v2.sablier.subgraphs import SablierSubgraph






def calculate_effective_deposits(
    start_sec: int,
    end_sec: int,
    events: Dict[str, list[DepositEvent]],
) -> tuple[list[UserDeposit], int]:
    
    # TODO: We can do this better and nicer
    effective_deposit_calculator = DefaultWeightedAverageWithSablierTimebox()
    payload = UserEffectiveDepositPayload(
        epoch_start=start_sec,
        epoch_end=end_sec,
        lock_events_by_addr=events,
    )

    return effective_deposit_calculator.calculate_users_effective_deposits(payload)


async def calculate_pending_epoch_snapshot(
    deposit_events: DepositEventsRepository,
    epoch_number: int,
    epoch_start: int,
    epoch_end: int,
) -> PendingSnapshotDTO:
    
    # Get octant rewards
        # epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)
    # duration_sec = epoch_details.duration
    # return estimate_staking_proceeds(duration_sec)
    # eth_proceeds = await get_staking_proceeds(session, epoch_number, start_sec, end_sec)
    eth_proceeds = estimate_staking_proceeds(epoch_end - epoch_start)

    events = await deposit_events.get_all_users_events(
        epoch_number,
        epoch_start,
        epoch_end
    )
    user_deposits, total_effective_deposit = calculate_effective_deposits(epoch_start, epoch_end, events)

    # total_effective_deposit = 155654569757136462439580980
    rewards_settings = OctantRewardsSettings()

    octant_rewards = calculate_rewards(
        rewards_settings, eth_proceeds, total_effective_deposit
    )

    rewards = OctantRewardsDTO(
        staking_proceeds=eth_proceeds,
        locked_ratio=octant_rewards.locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=octant_rewards.total_rewards,
        vanilla_individual_rewards=octant_rewards.vanilla_individual_rewards,
        operational_cost=octant_rewards.operational_cost,
        ppf=octant_rewards.ppf_value,
        community_fund=octant_rewards.community_fund,
    )

    # events = await get_all_user_events(
    #     session,
    #     epochs_subgraph,
    #     sablier,
    #     epoch_number,
    #     epoch_start,
    #     epoch_end
    # )
    # user_deposits, total_effective_deposit = calculate_effective_deposits(epoch_start, epoch_end, events)

    user_budget_calculator = UserBudgetWithPPF()
    user_budgets = calculate_user_budgets(
        user_budget_calculator, rewards, user_deposits
    )

    return PendingSnapshotDTO(
        rewards=rewards, user_deposits=user_deposits, user_budgets=user_budgets
    )


async def get_budget(
    session: AsyncSession,
    epoch_number: int,
    user_address: str
) -> int:
    simulated_snapshot = await calculate_pending_epoch_snapshot(session, epoch_number)

    upcoming_budget = get_upcoming_budget(
        user_address, simulated_snapshot.user_budgets
    )

    return upcoming_budget


def simulate_user_events(
    end_sec: int,
    lock_duration: int,
    remaining_sec: int,
    glm_amount: int
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