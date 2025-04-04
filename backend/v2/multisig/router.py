import json
from fastapi import APIRouter

from hexbytes import HexBytes
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import DuplicateConsent, EffectiveDepositNotFoundException, InvalidEpoch, InvalidMultisigAddress, InvalidMultisigSignatureRequest
from app.infrastructure.database.multisig_signature import SigStatus
from app.modules.dto import SignatureOpType
from backend.app.modules.common.crypto.signature import EncodingStandardFor, encode_for_signing
from backend.v2.allocations.validators import SignatureVerifier, verify_logic
from backend.v2.crypto.contracts import GnosisSafeContracts
from backend.v2.crypto.dependencies import GetGnosisSafeContractsFactory
from backend.v2.multisig.services import _add_allocation_signature, _add_tos_signature, _approve_allocation_signatures, _approve_tos_signatures
from backend.v2.projects.dependencies import GetProjectsContracts
from backend.v2.users.repositories import get_user_tos_consent_status
from v2.allocations.router import allocate_v1
from v2.allocations.schemas import UserAllocationRequest, UserAllocationRequestPayloadV1, UserAllocationRequestV1
from v2.crypto.signatures import SignedMessageVerifier, hash_signable_message
from v2.multisig.repositories import get_last_pending_multisig, get_multisigs_for_allocation, get_multisigs_for_tos, save_pending_allocation, save_pending_tos
from v2.multisig.safe import SafeClient
from v2.multisig.schemas import PendingSignatureRequestV1, PendingSignatureResponseV1
from v2.users.dependencies import GetXRealIp
from v2.users.router import post_tos_status_for_user_v1
from v2.core.dependencies import GetCurrentTimestamp, GetSession
from v2.core.types import Address
from v2.deposits.dependencies import GetDepositEventsRepository
from v2.deposits.repositories import get_user_deposit
from v2.epoch_snapshots.repositories import get_pending_epoch_snapshot
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph
from v2.project_rewards.services import calculate_effective_deposits
from v2.deposits.schemas import (
    LockedRatioResponseV1,
    TotalEffectiveDepositResponseV1,
    UserEffectiveDepositResponseV1,
)


api = APIRouter(prefix="/multisig-signatures", tags=["Multisig Signatures"])


@api.get("/pending/{user_address}/type/{op_type}")
async def get_last_pending_signature(
    session: GetSession,
    user_address: Address, 
    op_type: SignatureOpType
) -> PendingSignatureResponseV1:
    """
    Retrieve last pending multisig signature for a specific user and type.
    """
    signature = await get_last_pending_multisig(session, user_address, op_type)

    # We do not want to return 404 when there is no pending signature
    if signature is None:
        return PendingSignatureResponseV1(message=None, hash=None)

    return PendingSignatureResponseV1(message=signature.message, hash=signature.safe_msg_hash)


@api.post("/pending/{user_address}/type/{op_type}", status_code=201)
async def add_pending_signature(
    # Dependencies
    session: GetSession,
    safe_contracts_factory: GetGnosisSafeContractsFactory,
    safe_client: SafeClient,
    projects_contracts: GetProjectsContracts,
    epoch_subgraph: GetEpochsSubgraph,
    epoch_contracts: GetEpochsContracts,
    alloc_signature_verifier: SignatureVerifier,
    # Request payload
    user_address: Address, 
    op_type: SignatureOpType,
    payload: PendingSignatureRequestV1,
    x_real_ip: GetXRealIp,
) -> None:


    if op_type == SignatureOpType.TOS and isinstance(payload.message, str):

        safe_contracts = safe_contracts_factory.for_address(user_address)

        return await _add_tos_signature(
            session,
            safe_client,
            safe_contracts,
            user_address,
            payload.message,
            x_real_ip
        )
    
    elif op_type == SignatureOpType.ALLOCATION and isinstance(payload.message, UserAllocationRequest):

        return await _add_allocation_signature(
            session,
            safe_client,
            safe_contracts,
            epoch_contracts,
            epoch_subgraph,
            projects_contracts,
            user_address,
            payload.message,
            x_real_ip
        )

    # If we get here, the operation type is unsupported
    raise InvalidMultisigSignatureRequest()

    # # verify signature
    # if op_type == SignatureOpType.ALLOCATION:
    #     if not verifier.verify_logic(
    #         context,
    #         user_address=user_address,
    #         payload=deserialize_payload(signature_msg),
    #     ):
    #         raise InvalidMultisigSignatureRequest()
    #     return EncodingStandardFor.DATA
    # else:
    #     if not verifier.verify_logic(
    #         context, user_address=user_address, message=signature_msg
    #     ):
    #         raise InvalidMultisigSignatureRequest()
    #     return EncodingStandardFor.TEXT



    # # message = signature_data.get("message")
    # encoding_standard = self._verify_signature(
    #     context, user_address, message, op_type
    # )
    # encoded_message = prepare_encoded_message(message, op_type, encoding_standard)
    # safe_message_hash = hash_signable_message(encoded_message)
    # message_hash = get_message_hash(user_address, safe_message_hash)
    # msg_to_save = prepare_msg_to_save(message, op_type)

    # self._verify_owner(user_address, message_hash)

    # database.multisig_signature.save_signature(
    #     user_address, op_type, msg_to_save, message_hash, safe_message_hash, user_ip
    # )
    # db.session.commit()
    




@api.patch("/pending/approve", status_code=204)
async def approve_pending_signatures_v1(
    session: GetSession,
    epoch_contracts: GetEpochsContracts,
) -> None:
    """
    This endpoint is used to approve pending signatures.
    It will approve all pending signatures and apply them to the user.
    """

    await _approve_tos_signatures(session)

    await _approve_allocation_signatures(session, epoch_contracts)
    

    # approvals = approve_pending_signatures()



        # allocation_approvals = _approve(SignatureOpType.ALLOCATION)
        # tos_approvals = _approve(SignatureOpType.TOS)

            # filters = MultisigFilters(type=op_type, status=SigStatus.PENDING)
            # pending_signatures = (
            #     database.multisig_signature.get_multisig_signatures_by_filters(filters)
            # )
            # new_staged_signatures, approved_signatures = approve_pending_signatures(
            #     self.staged_signatures, pending_signatures, self.is_mainnet
            # )

            # self.staged_signatures.extend(new_staged_signatures)

        # return ApprovedSignatureTypes(
        #     allocation_signatures=allocation_approvals, tos_signatures=tos_approvals
        # )


    # for tos_signature in approvals.tos_signatures:
    #     # We don't want to fail the whole process if one TOS fails
    #     try:
    #         tos_controller.post_user_terms_of_service_consent(
    #             tos_signature.user_address,
    #             tos_signature.signature,
    #             tos_signature.ip_address,
    #         )
    #         apply_pending_tos_signature(tos_signature.id)

    #     except Exception as e:
    #         app.logger.error(f"Error confirming TOS signature: {e}")

    # for allocation_signature in approvals.allocation_signatures:
    #     # We don't want to fail the whole process if one allocation fails
    #     try:
    #         message = json.loads(allocation_signature.message)
    #         message["signature"] = allocation_signature.signature
    #         allocations_controller.allocate(
    #             allocation_signature.user_address,
    #             message,
    #             is_manually_edited=message.get("isManuallyEdited"),
    #         )
    #         apply_pending_allocation_signature(allocation_signature.id)

    #     except Exception as e:
    #         app.logger.error(f"Error confirming allocation signature: {e}")
