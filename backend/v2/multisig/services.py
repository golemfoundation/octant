import logging

from hexbytes import HexBytes
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import (
    DuplicateConsent,
    InvalidEpoch,
    InvalidMultisigAddress,
)
from app.infrastructure.database.multisig_signature import SigStatus
from app.infrastructure.database.models import MultisigSignatures
from app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from v2.allocations.dependencies import GetSignatureVerifier, get_allocator
from v2.allocations.services import Allocator
from v2.matched_rewards.dependencies import (
    get_matched_rewards_estimator,
    get_matched_rewards_estimator_settings,
)
from v2.uniqueness_quotients.dependencies import GetUQScoreGetter
from v2.allocations.validators import verify_logic
from v2.crypto.contracts import GnosisSafeContracts
from v2.projects.dependencies import GetProjectsContracts
from v2.users.repositories import get_user_tos_consent_status
from v2.users.schemas import TosStatusRequestV1
from v2.allocations.router import allocate_v1
from v2.allocations.schemas import (
    UserAllocationRequestV1,
)
from v2.crypto.signatures import SignedMessageVerifier, hash_signable_message
from v2.multisig.repositories import (
    get_multisigs_for_allocation,
    get_multisigs_for_tos,
    save_pending_allocation,
    save_pending_tos,
)
from v2.multisig.safe import SafeClient
from v2.users.dependencies import GetXRealIp
from v2.users.router import post_tos_status_for_user_v1
from v2.core.types import Address
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph


async def _add_tos_signature(
    session: AsyncSession,
    safe_client: SafeClient,
    safe_contracts: GnosisSafeContracts,
    user_address: Address,
    message: str,
    ip_address: str,
) -> None:
    # Terms of Service can only be accepted once
    already_accepted = await get_user_tos_consent_status(session, user_address)
    if already_accepted:
        raise DuplicateConsent(user_address)

    # Prepare message for SAFE validation
    encoded_message = encode_for_signing(EncodingStandardFor.TEXT, message)
    safe_message_hash = hash_signable_message(encoded_message)
    message_hash = await safe_contracts.get_message_hash(HexBytes(safe_message_hash))
    message_hash = f"0x{message_hash.hex()}"

    message_details = await safe_client.get_message_details(message_hash, retries=3)
    if user_address != message_details["safe"]:
        raise InvalidMultisigAddress()

    # If all is good, save the signature
    await save_pending_tos(
        session, user_address, message, message_hash, safe_message_hash, ip_address
    )


async def _add_allocation_signature(
    session: AsyncSession,
    safe_client: SafeClient,
    safe_contracts: GnosisSafeContracts,
    epoch_contracts: GetEpochsContracts,
    epoch_subgraph: GetEpochsSubgraph,
    projects_contracts: GetProjectsContracts,
    user_address: Address,
    payload: UserAllocationRequestV1,
    x_real_ip: GetXRealIp,
) -> None:
    # Viable only in Allocation window, throw exception otherwise
    pending_epoch = await epoch_contracts.get_pending_epoch()
    if pending_epoch is None:
        raise InvalidEpoch()

    # Verification will throw exception if invalid
    await verify_logic(
        session=session,
        epoch_subgraph=epoch_subgraph,
        projects_contracts=projects_contracts,
        epoch_number=pending_epoch,
        payload=payload,
    )

    # Safe
    encoded_message = encode_for_signing(EncodingStandardFor.DATA, payload.model_dump())
    safe_message_hash = hash_signable_message(encoded_message)
    message_hash = await safe_contracts.get_message_hash(HexBytes(safe_message_hash))
    message_hash = f"0x{message_hash.hex()}"

    msg_to_save = payload.model_dump_json()

    # Verify owner
    message_details = await safe_client.get_message_details(message_hash, retries=3)
    if user_address != message_details["safe"]:
        raise InvalidMultisigAddress()

    # Save signature
    await save_pending_allocation(
        session, user_address, msg_to_save, message_hash, safe_message_hash, x_real_ip
    )


async def _approve_tos_signature(
    session: AsyncSession,
    safe_client: SafeClient,
    signed_message_verifier: SignedMessageVerifier,
    signature: MultisigSignatures,
) -> None:
    confirmed_signature = await safe_client.get_signature_if_confirmed(
        signature.msg_hash,
        signature.address,
    )

    if confirmed_signature is None:
        return None

    signature.confirmed_signature = confirmed_signature

    payload = TosStatusRequestV1(
        signature=signature.confirmed_signature,
    )

    # Just call dedicated API to add the consent
    await post_tos_status_for_user_v1(
        session, signed_message_verifier, signature.address, payload, signature.user_ip
    )

    # Mark the signature as approved
    signature.status = SigStatus.APPROVED
    await session.commit()


async def try_approve_tos_signatures(
    session: AsyncSession,
    signed_message_verifier: SignedMessageVerifier,
    safe_client: SafeClient,
) -> None:
    signatures = await get_multisigs_for_tos(session)

    for signature in signatures:
        try:
            await _approve_tos_signature(
                session,
                signed_message_verifier,
                safe_client,
                signature,
            )

        except Exception as e:
            logging.error(f"Error approving TOS signature: {e}")


async def _approve_allocation_signature(
    safe_client: SafeClient,
    allocator: Allocator,
    signature: MultisigSignatures,
) -> None:
    confirmed_signature = await safe_client.get_signature_if_confirmed(
        signature.msg_hash,
        signature.address,
    )

    if confirmed_signature is None:
        return None

    signature.confirmed_signature = confirmed_signature

    payload = UserAllocationRequestV1.model_validate_json(signature.message)
    payload.signature = signature.confirmed_signature

    request = UserAllocationRequestV1.model_validate_json(signature.message)

    # Make allocation
    await allocate_v1(
        allocator=allocator,
        allocation_request=request,
    )
    # Mark the signature as approved
    signature.status = SigStatus.APPROVED


async def try_approve_allocation_signatures(
    session: AsyncSession,
    epoch_contracts: GetEpochsContracts,
    epoch_subgraph: GetEpochsSubgraph,
    projects_contracts: GetProjectsContracts,
    signature_verifier: GetSignatureVerifier,
    uq_score_getter: GetUQScoreGetter,
    safe_client: SafeClient,
) -> None:
    # Making allocations is only possible in Allocation window
    pending_epoch = await epoch_contracts.get_pending_epoch()
    if pending_epoch is None:
        return None

    matched_rewards_estimator = await get_matched_rewards_estimator(
        pending_epoch,
        session,
        epoch_subgraph,
        get_matched_rewards_estimator_settings(),
    )

    allocator = await get_allocator(
        pending_epoch,
        session,
        signature_verifier,
        uq_score_getter,
        projects_contracts,
        matched_rewards_estimator,
    )

    signatures = await get_multisigs_for_allocation(session)

    for signature in signatures:
        try:
            await _approve_allocation_signature(
                safe_client,
                allocator,
                signature,
            )

        except Exception as e:
            logging.error(f"Error approving allocation signature: {e}")
