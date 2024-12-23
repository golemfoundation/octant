

from itertools import groupby
from operator import attrgetter
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


async def get_all_deposit_events_for_epoch(
    session: AsyncSession,
    epoch_number: int,
) -> dict[str, list[DepositEvent]]:
    
    results = await session.scalars(
        select(Deposit)
        .options(selectinload(Deposit.user))
        .where(Deposit.epoch == epoch_number)
    )

    return {
        result.user.address: result for result in results
    }


async def get_all_user_events(
        session: AsyncSession,
        epoch_number: int,
        start_sec: int,
        end_sec: int,
) -> dict[str, list[DepositEvent]]:
    
    # Get all locked amounts for the previous epoch
    epoch_start_locked_amounts = await get_all_deposit_events_for_epoch(
        session, epoch_number - 1
    )
    epoch_start_events = [
        DepositEvent(
            user=user,
            type=EventType.LOCK,
            timestamp=start_sec,
            amount=0,  # it is not a deposit in fact
            deposit_before=int(deposit.epoch_end_deposit),
        )
        for user, deposit in epoch_start_locked_amounts.items()
    ]

    sablier = SablierEventsGenerator()
    sablier_streams = await sablier.get_all_streams_history()
    mapped_streams = process_to_locks_and_unlocks(
        sablier_streams, from_timestamp=start_sec, to_timestamp=end_sec
    )
    epoch_events = []
    epoch_events += flatten_sablier_events(mapped_streams, FlattenStrategy.ALL)
    epoch_events += get_locks_by_timestamp_range(start_sec, end_sec)
    epoch_events += get_unlocks_by_timestamp_range(start_sec, end_sec)

    epoch_events = [DepositEvent.from_dict(event) for event in epoch_events]
    sorted_events = sorted(epoch_events, key=attrgetter("user", "timestamp"))

    user_events = {
        k: list(g) for k, g in groupby(sorted_events, key=attrgetter("user"))
    }

    for event in epoch_start_events:
        if event.user in user_events:
            user_events[event.user].insert(0, event)
        else:
            user_events[event.user] = [event]

    epoch_start_users = list(map(attrgetter("user"), epoch_start_events))
    for user_address in user_events:
        if user_address not in epoch_start_users:
            user_events[user_address].insert(
                0,
                DepositEvent(
                    user_address,
                    EventType.LOCK,
                    timestamp=start_sec,
                    amount=0,
                    deposit_before=0,
                ),
            )

        user_events[user_address] = unify_deposit_balances(
            user_events[user_address]
        )

    return user_events


def calculate_effective_deposits(
    start_sec: int,
    end_sec: int,
    events: Dict[str, list[DepositEvent]],
) -> tuple[list[UserDeposit], int]:
    
    effective_deposit_calculator = DefaultWeightedAverageWithSablierTimebox()
    payload = UserEffectiveDepositPayload(
        epoch_start=start_sec,
        epoch_end=end_sec,
        lock_events_by_addr=events,
    )

    return effective_deposit_calculator.calculate_users_effective_deposits(payload)


async def get_octant_rewards(
    session: AsyncSession,
    epoch_number: int,
    start_sec: int,
    end_sec: int,
) -> OctantRewardsDTO:
    
    # epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)
    # duration_sec = epoch_details.duration
    # return estimate_staking_proceeds(duration_sec)
    eth_proceeds = await get_staking_proceeds(session, epoch_number, start_sec, end_sec)

    events = await get_all_user_events(session, epoch_number, start_sec, end_sec)
    user_deposits, total_effective_deposit = calculate_effective_deposits(start_sec, end_sec, events)

    rewards_settings = OctantRewardsSettings()

    octant_rewards = calculate_rewards(
        rewards_settings, eth_proceeds, total_effective_deposit
    )

    (
        locked_ratio,
        total_rewards,
        vanilla_individual_rewards,
        op_cost,
        ppf,
        community_fund,
    ) = (
        octant_rewards.locked_ratio,
        octant_rewards.total_rewards,
        octant_rewards.vanilla_individual_rewards,
        octant_rewards.operational_cost,
        octant_rewards.ppf_value,
        octant_rewards.community_fund,
    )

    return OctantRewardsDTO(
        staking_proceeds=eth_proceeds,
        locked_ratio=locked_ratio,
        total_effective_deposit=total_effective_deposit,
        total_rewards=total_rewards,
        vanilla_individual_rewards=vanilla_individual_rewards,
        operational_cost=op_cost,
        ppf=ppf,
        community_fund=community_fund,
    )


async def calculate_pending_epoch_snapshot(
    session: AsyncSession,
    epoch_number: int
) -> PendingSnapshotDTO:
    
    octant_rewards = await get_octant_rewards(session, epoch_number, start_sec, end_sec)

    events = await get_all_user_events(session, epoch_number, start_sec, end_sec)
    user_deposits, total_effective_deposit = calculate_effective_deposits(start_sec, end_sec, events)

    user_budget_calculator = UserBudgetWithPPF()
    user_budgets = calculate_user_budgets(
        user_budget_calculator, octant_rewards, user_deposits
    )

    return PendingSnapshotDTO(
        rewards=octant_rewards, user_deposits=user_deposits, user_budgets=user_budgets
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
