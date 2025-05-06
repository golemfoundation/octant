import logging

from app import exceptions
from app.infrastructure.exception_handler import ExceptionHandler
from app.legacy.core.epochs.epoch_snapshots import (
    FinalizedSnapshotStatus,
    PendingSnapshotStatus,
    finalized_snapshot_status,
    pending_snapshot_status,
)
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from v2.epoch_snapshots.repositories import (
    get_last_finalized_snapshot_epoch_number,
    get_last_pending_snapshot_epoch_number,
)
from v2.epochs.subgraphs import EpochsSubgraph
from web3 import AsyncWeb3


async def check_blockchain(w3: AsyncWeb3, expected_chain_id: int) -> bool:
    """
    Check if the chain RPC is healthy.
    """
    print(f"w3: {w3}")
    print(f"w3.eth: {w3.eth}")
    print(f"w3.eth.chain_id: {w3.eth.chain_id}")
    try:
        return await w3.eth.chain_id == expected_chain_id
    except Exception as e:
        logging.warning(f"[Healthcheck] blockchain is down with an error: {e}")
        ExceptionHandler.print_stacktrace(e)
        return False


async def check_database(sessionmaker: async_sessionmaker[AsyncSession]) -> bool:
    """
    Check if the database is healthy.
    """
    try:
        async with sessionmaker() as session:
            result = await session.execute(text("SELECT 1"))
            return len(result.fetchall()) > 0
    except Exception as e:
        logging.warning(f"[Healthcheck] db is down with an error: {e}")
        ExceptionHandler.print_stacktrace(e)
        return False


async def check_subgraph(epochs_subgraph: EpochsSubgraph) -> bool:
    """
    Check if the subgraph is healthy.
    """
    try:
        indexed_block_num = await epochs_subgraph.get_indexed_block_num()
        return indexed_block_num > 0
    except Exception as e:
        logging.warning(f"[Healthcheck] subgraph is down with an error: {e}")
        ExceptionHandler.print_stacktrace(e)
        return False


async def get_finalized_snapshot_status(
    session: AsyncSession,
    current_epoch_number: int,
    is_decision_window_open: bool,
) -> FinalizedSnapshotStatus:
    """
    Get the finalized snapshot status.
    """

    last_snapshot_epoch_number = await get_last_finalized_snapshot_epoch_number(session)

    try:
        return finalized_snapshot_status(
            current_epoch_number, last_snapshot_epoch_number, is_decision_window_open
        )
    except exceptions.SnapshotTooEarly:
        logging.error(
            f"Database inconsistent? Current epoch {current_epoch_number}, last finalized snapshot for epoch {last_snapshot_epoch_number}, while voting window is open"
        )
        return FinalizedSnapshotStatus.ERROR
    except exceptions.MissingSnapshot:
        logging.error(
            f"Database inconsistent? Current epoch {current_epoch_number}, last finalized snapshot for epoch {last_snapshot_epoch_number}"
        )
        return FinalizedSnapshotStatus.ERROR


async def get_pending_snapshot_status(
    session: AsyncSession,
    current_epoch_number: int,
) -> PendingSnapshotStatus:
    """
    Get the pending snapshot status.
    """

    last_snapshot_epoch_number = await get_last_pending_snapshot_epoch_number(session)
    try:
        return pending_snapshot_status(current_epoch_number, last_snapshot_epoch_number)
    except exceptions.MissingSnapshot:
        logging.error(
            f"Database inconsistent? Current epoch {current_epoch_number}, last pending snapshot for epoch {last_snapshot_epoch_number}"
        )
        return PendingSnapshotStatus.ERROR
