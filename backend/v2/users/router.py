from fastapi import APIRouter

from app.exceptions import InvalidEpoch
from v2.uniqueness_quotients.repositories import get_all_uqs_by_epoch
from v2.core.types import Address
from v2.uniqueness_quotients.dependencies import GetUQScoreGetter
from v2.core.dependencies import GetSession
from v2.user_patron_mode.repositories import (
    get_all_patrons_at_timestamp,
    get_budgets_by_users_addresses_and_epoch,
)
from v2.users.schemas import (
    AllUsersUQResponseV1,
    EpochPatronsResponseV1,
    UQResponseV1,
    UserUQResponseV1,
)
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


@api.get("/{user_address}/uq/{epoch_number}")
async def get_uq_for_user_and_epoch_v1(
    uq_score_getter: GetUQScoreGetter,
    # Request Parameters
    user_address: Address,
    epoch_number: int,
) -> UQResponseV1:
    """
    Returns user's uniqueness quotient score for given epoch
    """

    uq_score = await uq_score_getter.get_or_calculate(
        epoch_number,
        user_address,
        should_save=False,
    )

    return UQResponseV1(uniqueness_quotient=uq_score)


@api.get("/uq/{epoch_number}/all")
async def get_all_uqs_for_epoch_v1(
    session: GetSession,
    # Request Parameters
    epoch_number: int,
) -> AllUsersUQResponseV1:
    """
    Returns all uniqueness quotient scores for all users (that have a UQ score stored) for given epoch
    """

    all_uqs = await get_all_uqs_by_epoch(session, epoch_number)

    return AllUsersUQResponseV1(
        uqs_info=[
            UserUQResponseV1(
                user_address=uq.user.address, uniqueness_quotient=uq.validated_score
            )
            for uq in all_uqs
        ]
    )
