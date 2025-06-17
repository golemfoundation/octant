"""
User management and information endpoints.

This module provides endpoints for managing user-related operations including:
- Patron mode management
- Uniqueness quotient (UQ) score retrieval
- Antisybil status management
- Terms of Service (TOS) consent
- Sablier stream information

Key Concepts:
    - Patron Mode:
        - Users can toggle patron mode to opt out of receiving rewards
        - Affects budget calculations and allocations
        - Can be enabled/disabled with signature verification
        - Toggling during allocation window revokes existing allocations

    - Uniqueness Quotient (UQ):
        - Measures user uniqueness to prevent sybil attacks
        - Based on Gitcoin Passport score
        - Three possible values:
            - 1.0: High passport score (>15)
            - 0.01: Low passport score
            - 0.0: Timeout list or no score
        - Used in matched rewards calculation

    - Antisybil Status:
        - Tracks user's Gitcoin Passport verification
        - Includes score, expiration, and timeout status
        - Can be refreshed manually (except for delegated addresses)
        - Cached to reduce API calls

    - Terms of Service:
        - One-time acceptance required
            - Can be revoked by us eg when we change the terms of service
        - Requires signature verification
        - Tracks IP address for security
        - Prevents duplicate acceptances

    - Sablier Streams:
        - Tracks user's reward streams
        - Includes amount, availability, and status
        - Can be queried per user or globally
        - Integrates with Sablier protocol
"""

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
    Get list of patron mode users with positive budgets for a specific epoch.

    This endpoint returns addresses of users who:
    1. Have enabled patron mode
    2. Have a positive budget in the specified epoch
    3. Were in patron mode at the epoch's finalization

    Args:
        epoch_number: The epoch to check patron status for

    Returns:
        EpochPatronsResponseV1: List of patron addresses with positive budgets

    Raises:
        InvalidEpoch: If the specified epoch doesn't exist
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
    Get user's uniqueness quotient score for a specific epoch.

    This endpoint calculates or retrieves the cached UQ score for a user.
    The score is based on their Gitcoin Passport verification and affects
    their matched rewards eligibility.

    Args:
        user_address: The user's Ethereum address
        epoch_number: The epoch to get the score for

    Returns:
        UQResponseV1: The user's UQ score (0.0, 0.01, or 1.0)

    Note:
        - Score is not persisted if not already cached
        - Used in matched rewards calculation
        - Based on Gitcoin Passport score
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
    Get all cached uniqueness quotient scores for an epoch.

    This endpoint returns UQ scores for all users who have a cached score
    in the specified epoch. Useful for batch processing and verification.

    Args:
        epoch_number: The epoch to get scores for

    Returns:
        AllUsersUQResponseV1: List of user addresses and their UQ scores

    Note:
        - Only returns scores that have been previously calculated and cached
        - Does not calculate new scores
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
    Get user's current antisybil verification status.

    This endpoint returns the user's Gitcoin Passport verification status,
    including their score, expiration time, and timeout list status.

    Args:
        user_address: The user's Ethereum address

    Returns:
        AntisybilStatusResponseV1: User's verification status and details

    Raises:
        GPStampsNotFound: If user has no Gitcoin Passport stamps

    Note:
        - Requires existing Gitcoin Passport stamps
        - Score is based on valid stamps
        - Includes timeout list status
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
    Refresh user's antisybil verification status.

    This endpoint fetches fresh Gitcoin Passport data and updates the cached status.
    Cannot be used for delegated addresses as they have pre-verified scores.

    Args:
        user_address: The user's Ethereum address

    Returns:
        204: Refresh successful

    Raises:
        AddressAlreadyDelegated: If address has delegated score
        504: If Gitcoin Passport service is unavailable

    Note:
        - Updates cached stamps and score
        - Forces score to 0 for timeout list addresses
        - Cannot refresh delegated addresses
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
    Check if user has accepted Terms of Service.

    This endpoint verifies whether a user has previously accepted the Terms of Service.
    TOS acceptance is required for certain operations.

    Args:
        user_address: The user's Ethereum address

    Returns:
        TosStatusResponseV1: Whether TOS has been accepted

    Note:
        - One-time acceptance is required
        - Status is permanent once accepted
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
    Accept Terms of Service for a user.

    This endpoint records a user's acceptance of the Terms of Service.
    Requires a valid signature to prevent unauthorized acceptances.

    Args:
        user_address: The user's Ethereum address
        payload: Contains the signature for verification
        x_real_ip: User's IP address for security tracking

    Returns:
        TosStatusResponseV1: Confirmation of acceptance

    Raises:
        DuplicateConsent: If TOS already accepted
        InvalidSignature: If signature verification fails

    Note:
        - Requires valid signature
        - Tracks IP address
        - One-time acceptance only
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
    Check user's patron mode status.

    This endpoint returns whether a user has enabled patron mode.
    Patron mode affects reward distribution and allocation eligibility.

    Args:
        user_address: The user's Ethereum address

    Returns:
        PatronModeResponseV1: Current patron mode status

    Note:
        - Affects reward calculations
        - Can be toggled with signature
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

    This endpoint enables or disables patron mode for a user.
    Requires signature verification and may affect existing allocations.

    Args:
        user_address: The user's Ethereum address
        payload: Contains the signature for verification

    Returns:
        PatronModeResponseV1: Updated patron mode status

    Raises:
        InvalidSignature: If signature verification fails

    Note:
        - Requires valid signature
        - Revokes allocations if toggled during allocation window
        - Changes take effect immediately
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
    Get user's Sablier reward streams.

    This endpoint returns details about a user's active and historical
    reward streams from the Sablier protocol.

    Args:
        user_address: The user's Ethereum address

    Returns:
        SablierStreamsResponseV1: List of stream details including:
            - Amount
            - Availability date
            - Remaining amount
            - Cancellation status
            - Recipient address

    Note:
        - Includes both active and historical streams
        - Streams are time-locked rewards
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
    Get all Sablier reward streams.

    This endpoint returns details about all reward streams in the system,
    regardless of recipient. Useful for monitoring and verification.

    Returns:
        SablierStreamsResponseV1: List of all stream details including:
            - Amount
            - Availability date
            - Remaining amount
            - Cancellation status
            - Recipient address

    Note:
        - Includes all streams in the system
        - Useful for global monitoring
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
