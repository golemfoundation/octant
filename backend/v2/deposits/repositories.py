

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
from v2.epochs.subgraphs import EpochsSubgraph
from v2.sablier.subgraphs import SablierSubgraph



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




class DepositEventsRepository:
    def __init__(
            self, 
            session: AsyncSession, 
            epochs_subgraph: EpochsSubgraph, 
            sablier_subgraph: SablierSubgraph
        ):
        self.session = session
        self.epochs_subgraph = epochs_subgraph
        self.sablier_subgraph = sablier_subgraph

    async def get_all_users_events(
        self,
        epoch_number: int,
        start_sec: int,
        end_sec: int,
    ) -> dict[str, list[DepositEvent]]:
        """
        Returns all user events (LOCK, UNLOCK) for a given epoch.
        """
        
        # Get all locked amounts for the previous epoch
        epoch_start_locked_amounts = await get_all_deposit_events_for_epoch(
            self.session, epoch_number - 1
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

        sablier_streams = await self.sablier_subgraph.get_all_streams_history()
        mapped_streams = process_to_locks_and_unlocks(
            sablier_streams, from_timestamp=start_sec, to_timestamp=end_sec
        )
        # print("Mapped streams", mapped_streams)
        epoch_events = []
        epoch_events += flatten_sablier_events(mapped_streams, FlattenStrategy.ALL)
        epoch_events += await self.epochs_subgraph.fetch_locks_by_timestamp_range(start_sec, end_sec)
        epoch_events += await self.epochs_subgraph.fetch_unlocks_by_timestamp_range(start_sec, end_sec)

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
