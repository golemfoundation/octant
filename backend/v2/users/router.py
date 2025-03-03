from datetime import timezone
from fastapi import APIRouter, Header, Request, Response

from app.exceptions import (
    AddressAlreadyDelegated,
    DuplicateConsent,
    GPStampsNotFound,
    InvalidEpoch,
    InvalidSignature,
)
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from app.modules.user.tos.core import build_consent_message
from v2.allocations.repositories import soft_delete_user_allocations_by_epoch
from v2.crypto.dependencies import GetSignedMessageVerifier
from v2.users.dependencies import GetXHeadersSettings
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


# tos status
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


@api.post("/{user_address}/tos")
async def post_tos_status_for_user_v1(
    session: GetSession,
    signed_message_verifier: GetSignedMessageVerifier,
    x_headers_settings: GetXHeadersSettings,
    # Request Parameters
    user_address: Address,
    payload: TosStatusRequestV1,
    request: Request,
    x_real_ip: str | None = Header(None, alias="X-Real-IP"),
) -> TosStatusResponseV1:
    """
    Updates user's Terms of Service status.
    """

    # signature = ns.payload.get("signature")
    # user_ip = ns.payload.get("x-real-ip")

    # Terms of Service can only be accepted once
    already_accepted = await get_user_tos_consent_status(session, user_address)
    if already_accepted:
        raise DuplicateConsent(user_address)

    # Get the IP address from the request
    if x_headers_settings.x_real_ip_required:
        ip_address = x_real_ip
    else:
        ip_address = request.client.host

    # Build the message & verify the signature
    msg_text = build_consent_message(user_address)
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)
    is_valid = await signed_message_verifier.verify(
        user_address, encoded_msg, payload.signature
    )
    if not is_valid:
        raise InvalidSignature(user_address, payload.signature)

    # self.verifier.verify(
    #     context, user_address=user_address, consent_signature=consent_signature
    # )

    # Verifier
    # def _verify_logic(self, _: Context, **kwargs):
    #     user_address = kwargs["user_address"]
    #     consent = database.user_consents.get_last_by_address(user_address)
    #     if consent is not None:
    #         raise DuplicateConsent(user_address)

    # def _verify_signature(self, _: Context, **kwargs):
    #     user_address, signature = kwargs["user_address"], kwargs["consent_signature"]

    #     if not core.verify_signature(user_address, signature):
    #         raise InvalidSignature(user_address, signature)

    # msg_text = build_consent_message(user_address)
    # encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)

    # return verify_signed_message(user_address, encoded_msg, signature)

    # database.user_consents.add_consent(user_address, ip_address)
    # db.session.commit()

    await add_user_tos_consent(session, user_address, ip_address)

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
    toggle_msg = "enable" if not current_status else "disable"
    message = f"Signing this message will {toggle_msg} patron mode for address {user_address}."
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, message)
    is_valid = await signed_message_verifier.verify(
        user_address, encoded_msg, payload.signature
    )
    if not is_valid:
        raise InvalidSignature(user_address, payload.signature)

    # if not patron_mode_crypto.verify(user_address, not patron_mode_status, signature):
    #     raise InvalidSignature(user_address, signature)

    # patron_mode_status = patron_mode_core.toggle_patron_mode(user_address)

    next_status = await toggle_patron_mode(session, user_address, current_datetime)

    # This will return None if we are outside of the allocation window
    epoch_number = await epochs_contracts.get_pending_epoch()
    if epoch_number is not None:
        await soft_delete_user_allocations_by_epoch(session, user_address, epoch_number)

    await session.commit()

    return PatronModeResponseV1(status=next_status)

    # try:
    #     allocations_controller.revoke_previous_allocation(user_address)
    # except NotInDecisionWindow:
    #     app.logger.info(
    #         f"Not in allocation period. Skipped revoking previous allocation for user {user_address}"
    #     )

    # db.session.commit()
    # return patron_mode_status
