from fastapi import APIRouter

from app.exceptions import (
    AntisybilScoreTooLow,
    DelegationAlreadyExists,
    DelegationDoesNotExist,
    InvalidDelegationForLockingAddress,
    InvalidDelegationRequest,
    InvalidRecalculationRequest,
    InvalidSignature,
)
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from app.modules.score_delegation.core import MIN_SCORE
from v2.delegations.validators import validate_comma_separated_addresses
from v2.uniqueness_quotients.repositories import add_gp_stamps
from v2.project_rewards.services import calculate_effective_deposits
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph
from v2.crypto.dependencies import GetSignedMessageVerifier
from v2.delegations.repositories import contains_hashed_address, save_delegation
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.uniqueness_quotients.dependencies import GetGitcoinScorerClient, GetTimeoutList
from v2.core.dependencies import GetCurrentDatetime, GetCurrentTimestamp, GetSession
from v2.delegations.dependencies import GetDelegationService
from v2.delegations.schemas import DelegationRequestV1, DelegationCheckResponseV1


api = APIRouter(prefix="/delegation", tags=["Delegations"])


@api.post("/delegate", status_code=201)
async def delegate_uq_score_v1(
    session: GetSession,
    signed_message_verifier: GetSignedMessageVerifier,
    timeout_list: GetTimeoutList,
    delegations: GetDelegationService,
    deposit_events_repository: GetDepositEventsRepository,
    epochs_contracts: GetEpochsContracts,
    epochs_subgraph: GetEpochsSubgraph,
    gitcoin_scorer: GetGitcoinScorerClient,
    request: DelegationRequestV1,
    current_timestamp: GetCurrentTimestamp,
    current_datetime: GetCurrentDatetime,
) -> None:
    """
    Delegate UQ score from secondary address to primary address
    """

    # Validate signatures on the message
    msg_text = f"Delegation of UQ score from {request.secondary_address} to {request.primary_address}"
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)

    primary_verified = await signed_message_verifier.verify(
        request.primary_address, encoded_msg, request.primary_signature
    )
    if not primary_verified:
        raise InvalidSignature(request.primary_address, request.primary_signature)

    secondary_verified = await signed_message_verifier.verify(
        request.secondary_address, encoded_msg, request.secondary_signature
    )
    if not secondary_verified:
        raise InvalidSignature(request.secondary_address, request.secondary_signature)

    # Address on timeout list cannot delegate
    if request.secondary_address in timeout_list:
        # TODO: separate exception?
        raise InvalidDelegationRequest()

    # Check if delegation already exists
    primary_hash = delegations.hash_primary(request.primary_address)
    primary_exists = await contains_hashed_address(session, primary_hash)
    if primary_exists:
        raise DelegationAlreadyExists()

    # Check if secondary address has delegation
    secondary_hash = delegations.hash_secondary(request.secondary_address)
    secondary_exists = await contains_hashed_address(session, secondary_hash)
    if secondary_exists:
        raise DelegationAlreadyExists()

    # Make sure secondary address has enough score to delegate
    gp_score = await gitcoin_scorer.fetch_score(
        request.secondary_address, current_datetime
    )
    if gp_score.score < MIN_SCORE:
        raise AntisybilScoreTooLow(gp_score.score, MIN_SCORE)

    # ------- BEGIN budget related -------
    # Get current epoch details
    epoch_number = await epochs_contracts.get_current_epoch()
    epoch_details = await epochs_subgraph.fetch_epoch_by_number(epoch_number)

    # We SIMULATE the epoch end as if it ended now
    epoch_end = current_timestamp
    epoch_start = epoch_details.fromTs

    # If secondary address has effective deposit, it cannot delegate
    events = await deposit_events_repository.get_all_users_events(
        epoch_number, epoch_start, epoch_end
    )
    user_deposits, _ = calculate_effective_deposits(epoch_start, epoch_end, events)
    if user_deposits and user_deposits[0].effective_deposit > 0:
        raise InvalidDelegationForLockingAddress()

    # ------- END budget related -------

    # Update GitcoinPassport Stamps of primary address based on secondary address
    await add_gp_stamps(
        session,
        request.primary_address,
        gp_score.score,
        gp_score.expires_at,
        gp_score.stamps,
    )

    # Save delegation
    both_hash = delegations.hash_both(
        request.primary_address, request.secondary_address
    )

    await save_delegation(session, primary_hash, secondary_hash, both_hash)


@api.put("/recalculate", status_code=204)
async def recalculate_uq_score_v1(
    session: GetSession,
    delegations: GetDelegationService,
    request: DelegationRequestV1,
) -> None:
    """
    Recalculate UQ score from secondary address to primary address.
    We keep this endpoint for compatibility with the old API, but it will always raise an error.
    """

    # If the delegation exists we will have both_hash, primary_hash and secondary_hash in database
    # So then if it exists we know delegation was made
    # If it does not exist, we know it was not made so it does not make sense to recalculate
    both_hash = delegations.hash_both(
        request.primary_address, request.secondary_address
    )
    both_exists = await contains_hashed_address(session, both_hash)
    if not both_exists:
        raise DelegationDoesNotExist()

    raise InvalidRecalculationRequest()


@api.get("/check/{user_addresses}")
async def check_delegation_v1(
    delegation_service: GetDelegationService,
    # Request Parameters
    user_addresses: str,
) -> DelegationCheckResponseV1:
    """
    Check if the user has delegated UQ score to another address
    """

    addresses = validate_comma_separated_addresses(user_addresses)

    # Find all delegations for any combination of given addresses
    pairs = await delegation_service.find_all(addresses)
    if not pairs:
        raise DelegationDoesNotExist()

    secondary, primary = pairs[0]
    return DelegationCheckResponseV1(
        primary=primary,
        secondary=secondary,
    )
