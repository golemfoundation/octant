from fastapi import APIRouter

from app.exceptions import InvalidEpoch
from v2.core.dependencies import GetSession
from v2.user_patron_mode.repositories import (
    get_all_patrons_at_timestamp,
    get_budgets_by_users_addresses_and_epoch,
)
from v2.users.schemas import EpochPatronsResponseV1
from v2.epochs.dependencies import GetEpochsSubgraph

api = APIRouter(prefix="/user", tags=["user"])


@api.get("/patrons/{epoch_number}")
async def get_patrons_for_epoch_v1(
    session: GetSession,
    epoch_subgraph: GetEpochsSubgraph,
    # Request Parameters
    epoch_number: int,
) -> EpochPatronsResponseV1:
    """
    Returns a list of users who toggled patron mode and has a positive budget in given epoch
    """

    epoch_details = await epoch_subgraph.get_epoch_by_number(epoch_number)
    if epoch_details is None:
        raise InvalidEpoch()

    patrons = await get_all_patrons_at_timestamp(
        session, epoch_details.finalized_timestamp.datetime()
    )

    budgets = await get_budgets_by_users_addresses_and_epoch(
        session, patrons, epoch_number
    )

    # Return only users with a positive budget
    return EpochPatronsResponseV1(
        patrons=[address for address, budget in budgets.items() if budget > 0]
    )
