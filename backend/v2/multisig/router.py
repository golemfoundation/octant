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
