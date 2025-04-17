import logging
import traceback

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import (
    DuplicateConsent,
    InvalidEpoch,
    InvalidMultisigAddress,
)
from app.infrastructure.database.multisig_signature import SigStatus
from app.infrastructure.database.models import MultisigSignatures
from v2.epochs.contracts import EpochsContract
from v2.epochs.subgraphs import EpochsSubgraph
from v2.projects.contracts import ProjectsContracts
from v2.uniqueness_quotients.services import UQScoreGetter
from v2.allocations.dependencies import get_allocator
from v2.allocations.services import Allocator
from v2.matched_rewards.dependencies import (
    get_matched_rewards_estimator,
    get_matched_rewards_estimator_settings,
)
from v2.allocations.validators import SignatureVerifier, verify_logic
from v2.multisig.contracts import SafeContractsFactory
from v2.users.repositories import get_user_tos_consent_status
from v2.users.schemas import TosStatusRequestV1
from v2.allocations.router import allocate_v1
from v2.allocations.schemas import (
    UserAllocationRequest,
    UserAllocationRequestRawV1,
    UserAllocationRequestV1,
)
from v2.crypto.signatures import SignedMessageVerifier
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


async def _add_tos_signature(
    session: AsyncSession,
    safe_client: SafeClient,
    safe_contracts: SafeContractsFactory,
    user_address: Address,
    message: str,
    ip_address: str,
) -> None:
    # Terms of Service can only be accepted once
    already_accepted = await get_user_tos_consent_status(session, user_address)
    if already_accepted:
        raise DuplicateConsent(user_address)

    # Prepare message for SAFE validation
    safe_message_hash = safe_contracts.get_safe_message_hash_for_tos(message)
    message_hash = await safe_contracts.get_message_hash(
        user_address, safe_message_hash
    )

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
    safe_contracts: SafeContractsFactory,
    epoch_contracts: EpochsContract,
    epoch_subgraph: EpochsSubgraph,
    projects_contracts: ProjectsContracts,
    user_address: Address,
    payload: UserAllocationRequestRawV1,
    x_real_ip: GetXRealIp,
) -> None:
    # Viable only in Allocation window, throw exception otherwise
    pending_epoch = await epoch_contracts.get_pending_epoch()
    if pending_epoch is None:
        raise InvalidEpoch()

    user_allocation_request = UserAllocationRequest(
        user_address=user_address,
        allocations=payload.payload.allocations,
        nonce=payload.payload.nonce,
        signature="placeholder",
        is_manually_edited=payload.is_manually_edited,
    )

    # Verification will throw exception if invalid
    await verify_logic(
        session=session,
        epoch_subgraph=epoch_subgraph,
        projects_contracts=projects_contracts,
        epoch_number=pending_epoch,
        payload=user_allocation_request,
    )

    safe_message_hash = safe_contracts.get_safe_message_hash_for_allocation(
        user_allocation_request
    )
    message_hash = await safe_contracts.get_message_hash(
        user_address, safe_message_hash
    )

    msg_to_save = payload.model_dump_json(by_alias=True)

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
                safe_client,
                signed_message_verifier,
                signature,
            )

        except Exception as e:
            print(traceback.format_exc())
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

    payload = UserAllocationRequestRawV1.model_validate_json(signature.message)

    request = UserAllocationRequestV1(
        payload=payload.payload,
        is_manually_edited=payload.is_manually_edited,
        user_address=signature.address,
        signature=signature.confirmed_signature,
    )

    # Make allocation
    await allocate_v1(
        allocator=allocator,
        allocation_request=request,
    )
    # Mark the signature as approved
    signature.status = SigStatus.APPROVED


async def try_approve_allocation_signatures(
    session: AsyncSession,
    epoch_contracts: EpochsContract,
    epoch_subgraph: EpochsSubgraph,
    projects_contracts: ProjectsContracts,
    signature_verifier: SignatureVerifier,
    uq_score_getter: UQScoreGetter,
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
            print(f"Approving allocation signature: {signature.safe_msg_hash}")
            await _approve_allocation_signature(
                safe_client,
                allocator,
                signature,
            )

        except Exception as e:
            # print stack trace
            logging.error(f"Error approving allocation signature: {e}")
            logging.error(traceback.format_exc())
