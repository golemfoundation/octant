from datetime import timezone
from fastapi import APIRouter, Response

from app.exceptions import (
    AddressAlreadyDelegated,
    GPStampsNotFound,
    InvalidEpoch,
)
from v2.delegations.dependencies import GetDelegationService
from v2.uniqueness_quotients.repositories import (
    add_gp_stamps,
    get_all_uqs_by_epoch,
    get_gp_stamps_by_address,
)
from v2.core.types import Address
from v2.uniqueness_quotients.dependencies import (
    GetGitcoinScorerClient,
    GetUQScoreGetter,
)
from v2.core.dependencies import GetCurrentDatetime, GetSession

from v2.user_patron_mode.repositories import (
    get_all_patrons_at_timestamp,
    get_budgets_by_users_addresses_and_epoch,
)
from v2.users.schemas import (
    AllUsersUQResponseV1,
    AntisybilStatusResponseV1,
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


@api.get("/{user_address}/antisybil-status")
async def get_antisybil_status_for_user_v1(
    session: GetSession,
    uq_score_getter: GetUQScoreGetter,
    # Request Parameters
    user_address: Address,
    response: Response,
) -> AntisybilStatusResponseV1:
    """
    Returns user's antisybil status.
    """

    # If the user has no stamps, we return an unknown status
    gp_stamps = await get_gp_stamps_by_address(session, user_address)
    if gp_stamps is None:
        raise GPStampsNotFound()

    # If the user has saved stamps, we calculate the UQ score
    score = await uq_score_getter.get_gitcoin_passport_score(user_address)
    is_on_timeout_list = user_address in uq_score_getter.timeout_list
    expires_at = int(gp_stamps.expires_at.replace(tzinfo=timezone.utc).timestamp())

    return AntisybilStatusResponseV1(
        status="Known",
        score=score,
        expires_at=str(expires_at),
        is_on_time_out_list=is_on_timeout_list,
    )


@api.put("/{user_address}/antisybil-status", status_code=204)
async def refresh_antisybil_status_for_user_v1(
    session: GetSession,
    gitcoin_scorer: GetGitcoinScorerClient,
    delegations: GetDelegationService,
    uq_score_getter: GetUQScoreGetter,
    current_datetime: GetCurrentDatetime,
    # Request Parameters
    user_address: Address,
):
    """
    Refresh cached antisybil status for a user.
    If the user delegated the score, it will raise an error.

    Responses:
        204: Refresh successful
        504: Could not refresh antisybil status. Upstream is unavailable.
    """

    # Delegated addresses should not be refreshed
    # as they have score already delegated and calling gc scorer does not make sense
    if await delegations.exists(user_address):
        raise AddressAlreadyDelegated()

    # Refresh the score (fetch and save stamps)
    gc_score = await gitcoin_scorer.fetch_score(user_address, current_datetime)

    # We hardcode the score to 0 for addresses on the timeout list
    # as they are not eligible for any positive score
    if user_address in uq_score_getter.timeout_list:
        gc_score.score = 0.0

    await add_gp_stamps(
        session, user_address, gc_score.score, gc_score.expires_at, gc_score.stamps
    )
