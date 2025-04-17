from fastapi import APIRouter


from app.exceptions import (
    InvalidMultisigSignatureRequest,
)
from app.modules.dto import SignatureOpType
from v2.crypto.dependencies import GetSignedMessageVerifier
from v2.allocations.dependencies import GetSignatureVerifier
from v2.uniqueness_quotients.dependencies import GetUQScoreGetter
from v2.multisig.dependencies import GetSafeClient, GetSafeContractsFactory
from v2.multisig.services import (
    _add_allocation_signature,
    _add_tos_signature,
    try_approve_allocation_signatures,
    try_approve_tos_signatures,
)
from v2.projects.dependencies import GetProjectsContracts
from v2.allocations.schemas import (
    UserAllocationRequestRawV1,
)
from v2.multisig.repositories import (
    get_last_pending_multisig,
)
from v2.multisig.schemas import PendingSignatureRequestV1, PendingSignatureResponseV1
from v2.users.dependencies import GetXRealIp
from v2.core.dependencies import GetSession
from v2.core.types import Address
from v2.epochs.dependencies import GetEpochsContracts, GetEpochsSubgraph


api = APIRouter(prefix="/multisig-signatures", tags=["Multisig Signatures"])


@api.get("/pending/{user_address}/type/{op_type}")
async def get_last_pending_signature(
    session: GetSession, user_address: Address, op_type: SignatureOpType
) -> PendingSignatureResponseV1:
    """
    Retrieve last pending multisig signature for a specific user and type.
    """
    signature = await get_last_pending_multisig(session, user_address, op_type)

    # We do not want to return 404 when there is no pending signature
    if signature is None:
        return PendingSignatureResponseV1(message=None, hash=None)

    return PendingSignatureResponseV1(
        message=signature.message, hash=signature.safe_msg_hash
    )


@api.post("/pending/{user_address}/type/{op_type}", status_code=201)
async def add_pending_signature(
    # Dependencies
    session: GetSession,
    safe_contracts_factory: GetSafeContractsFactory,
    safe_client: GetSafeClient,
    epoch_subgraph: GetEpochsSubgraph,
    epoch_contracts: GetEpochsContracts,
    projects_contracts: GetProjectsContracts,
    # Request payload
    user_address: Address,
    op_type: SignatureOpType,
    payload: PendingSignatureRequestV1,
    x_real_ip: GetXRealIp,
) -> None:
    """
    Add a pending multisig signature for a specific user and type.
    """

    if op_type == SignatureOpType.TOS and isinstance(payload.message, str):
        return await _add_tos_signature(
            session,
            safe_client,
            safe_contracts_factory,
            user_address,
            payload.message,
            x_real_ip,
        )

    elif op_type == SignatureOpType.ALLOCATION and isinstance(
        payload.message, UserAllocationRequestRawV1
    ):
        return await _add_allocation_signature(
            session,
            safe_client,
            safe_contracts_factory,
            epoch_contracts,
            epoch_subgraph,
            projects_contracts,
            user_address,
            payload.message,
            x_real_ip,
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
    epoch_subgraph: GetEpochsSubgraph,
    projects_contracts: GetProjectsContracts,
    safe_client: GetSafeClient,
    signed_message_verifier: GetSignedMessageVerifier,
    signature_verifier: GetSignatureVerifier,
    uq_score_getter: GetUQScoreGetter,
) -> None:
    """
    This endpoint is used to approve pending signatures.
    It will approve all pending signatures and apply them to the user.
    """

    await try_approve_tos_signatures(
        session,
        signed_message_verifier,
        safe_client,
    )

    await try_approve_allocation_signatures(
        session,
        epoch_contracts,
        epoch_subgraph,
        projects_contracts,
        signature_verifier,
        uq_score_getter,
        safe_client,
    )
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
