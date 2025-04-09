from datetime import timezone
from fastapi import APIRouter, Response, status

from app.exceptions import (
    AddressAlreadyDelegated,
    DuplicateConsent,
    GPStampsNotFound,
    InvalidEpoch,
    InvalidSignature,
)
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from app.modules.user.tos.core import build_consent_message
from v2.sablier.dependencies import GetSablierSubgraph
from v2.allocations.repositories import soft_delete_user_allocations_by_epoch
from v2.crypto.dependencies import GetSignedMessageVerifier
from v2.users.dependencies import GetXRealIp
from v2.users.repositories import add_user_tos_consent, get_user_tos_consent_status
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
    get_user_patron_mode_status,
    toggle_patron_mode,
)
from v2.users.schemas import (
    AllUsersUQResponseV1,
    AntisybilStatusResponseV1,
    EpochPatronsResponseV1,
    PatronModeRequestV1,
    PatronModeResponseV1,
    SablierStreamItem,
    SablierStreamsResponseV1,
    TosStatusRequestV1,
    TosStatusResponseV1,
    UQResponseV1,
    UserUQResponseV1,
)
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph

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


@api.get("/{user_address}/tos")
async def get_tos_status_for_user_v1(
    session: GetSession,
    # Request Parameters
    user_address: Address,
) -> TosStatusResponseV1:
    """
    Returns true if given user has already accepted Terms of Service, false in the other case.
    """

    status = await get_user_tos_consent_status(session, user_address)
    return TosStatusResponseV1(accepted=status)


@api.post("/{user_address}/tos", status_code=status.HTTP_201_CREATED)
async def post_tos_status_for_user_v1(
    session: GetSession,
    signed_message_verifier: GetSignedMessageVerifier,
    # Request Parameters
    user_address: Address,
    payload: TosStatusRequestV1,
    x_real_ip: GetXRealIp,
) -> TosStatusResponseV1:
    """
    Updates user's Terms of Service status.
    """

    # Terms of Service can only be accepted once
    already_accepted = await get_user_tos_consent_status(session, user_address)
    if already_accepted:
        raise DuplicateConsent(user_address)

    # Build the message & verify the signature
    msg_text = build_consent_message(user_address)
    # TODO: At some point we should make this encode function a bit nicer, it's used in multiple places
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    is_valid = await signed_message_verifier.verify(
        user_address, encoded_msg, payload.signature
    )
    if not is_valid:
        raise InvalidSignature(user_address, payload.signature)

    # Add the consent and commit the session
    await add_user_tos_consent(session, user_address, x_real_ip)

    return TosStatusResponseV1(accepted=True)


@api.get("/{user_address}/patron-mode")
async def get_patron_mode_for_user_v1(
    session: GetSession,
    # Request Parameters
    user_address: Address,
) -> PatronModeResponseV1:
    """
    Returns true if given user has enabled patron mode, false in the other case.
    """

    status = await get_user_patron_mode_status(session, user_address)
    return PatronModeResponseV1(status=status)


@api.patch("/{user_address}/patron-mode")
async def patch_patron_mode_for_user_v1(
    session: GetSession,
    current_datetime: GetCurrentDatetime,
    epochs_contracts: GetEpochsContracts,
    signed_message_verifier: GetSignedMessageVerifier,
    # Request Parameters
    user_address: Address,
    payload: PatronModeRequestV1,
):
    """
    Toggle user's patron mode status.
    """

    current_status = await get_user_patron_mode_status(session, user_address)

    # Build the message & verify the signature
    # If we are currently in patron mode, we want to disable it
    # If we are not in patron mode, we want to enable it
    toggle_msg = "disable" if current_status else "enable"
    message = f"Signing this message will {toggle_msg} patron mode for address {user_address}."
    # TODO: At some point we should make this encode function a bit nicer, it's used in multiple places
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, message)
    is_valid = await signed_message_verifier.verify(
        user_address, encoded_msg, payload.signature
    )
    if not is_valid:
        raise InvalidSignature(user_address, payload.signature)

    # Toggle the patron mode and persist the change
    next_status = await toggle_patron_mode(session, user_address, current_datetime)

    # If we are in the allocation window, we need to revoke all previous allocations
    epoch_number = await epochs_contracts.get_pending_epoch()
    if epoch_number is not None:
        await soft_delete_user_allocations_by_epoch(session, user_address, epoch_number)

    # Let's make sure we return the correct status only if all the operations are successful
    await session.commit()

    return PatronModeResponseV1(status=next_status)


@api.get("/{user_address}/sablier-streams")
async def get_sablier_streams_for_user_v1(
    sablier_subgraph: GetSablierSubgraph,
    # Request Parameters
    user_address: Address,
) -> SablierStreamsResponseV1:
    """
    Returns an array of user's streams from Sablier with amounts, availability dates, remainingAmount and isCancelled flag.
    """

    streams = await sablier_subgraph.get_user_events_history(user_address)

    return SablierStreamsResponseV1(
        sablier_streams=[
            SablierStreamItem(
                amount=s["depositAmount"],
                date_available_for_withdrawal=s["endTime"],
                is_cancelled=s["canceled"],
                remaining_amount=s["intactAmount"],
                recipient_address=s["recipient"],
            )
            for s in streams
        ]
    )


@api.get("/sablier-streams/all")
async def get_all_sablier_streams_v1(
    sablier_subgraph: GetSablierSubgraph,
) -> SablierStreamsResponseV1:
    """
    Returns an array of all streams from Sablier with amounts, availability dates, remainingAmount and isCancelled flag.
    """

    streams = await sablier_subgraph.get_all_streams_history()
    return SablierStreamsResponseV1(
        sablier_streams=[
            SablierStreamItem(
                amount=s["depositAmount"],
                date_available_for_withdrawal=s["endTime"],
                is_cancelled=s["canceled"],
                remaining_amount=s["intactAmount"],
                recipient_address=s["recipient"],
            )
            for s in streams
        ]
    )
