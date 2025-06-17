"""
Multisig signature management endpoints for handling Gnosis Safe signatures.

This module provides endpoints for managing multisig signatures for two types of operations:
1. Terms of Service (TOS) acceptance
2. Allocation requests

Key Concepts:
    - Multisig Signatures:
        - Pending: Signature submitted but not yet confirmed
        - Confirmed: Signature verified on-chain
        - Approved: Signature processed and applied
        - Rejected: Signature invalid or duplicate

    - Operation Types:
        - TOS: Terms of Service acceptance
            - One-time operation per user
            - Requires Gnosis Safe signature
            - Prevents duplicate consent
        - Allocation: Reward distribution
            - Only available during allocation window
            - Requires Gnosis Safe signature
            - Includes allocation details and nonce

    - Signature Flow:
        1. User submits signature
        2. System verifies signature validity
        3. Signature stored as pending
        4. Client periodically checks signature status via API
        5. Once confirmed, signature is processed
        6. Operation is applied to user's account

    - Security Features:
        - Gnosis Safe message verification
        - IP address tracking
        - Nonce validation for allocations
        - Duplicate prevention for TOS
        - Allocation window validation
"""

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
    Retrieve the last pending multisig signature for a specific user and operation type.

    This endpoint returns the most recent pending signature for a user, which can be either
    a TOS acceptance or an allocation request. If no pending signature exists, returns
    empty message and hash.

    Path Parameters:
        - user_address: The Ethereum address of the user
        - op_type: The type of operation (TOS or ALLOCATION)

    Returns:
        PendingSignatureResponseV1 containing:
            - message: The signature message (TOS text or allocation request)
            - hash: The Gnosis Safe message hash

    Note:
        - Returns empty values if no pending signature exists
        - Does not return 404 for missing signatures
        - Only returns the most recent pending signature
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
    Add a pending multisig signature for a specific user and operation type.

    This endpoint processes new multisig signatures for either TOS acceptance or
    allocation requests. The signature is verified and stored as pending until
    confirmed on-chain.

    Path Parameters:
        - user_address: The Ethereum address of the user
        - op_type: The type of operation (TOS or ALLOCATION)

    Request Body:
        For TOS:
            - message: The TOS text to be signed
        For Allocation:
            - message: UserAllocationRequestRawV1 containing:
                - payload: Allocation details and nonce
                - is_manually_edited: Whether allocation was manually edited

    Returns:
        - 201: Signature successfully added as pending
        - 400: Invalid signature or request
        - 403: Operation not allowed (e.g., outside allocation window)

    Note:
        - TOS can only be accepted once per user
        - Allocations only allowed during allocation window
        - Signatures must be from user's Gnosis Safe
        - IP address is tracked for security
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
    Approve all pending signatures that have been confirmed on-chain.

    This endpoint processes all pending signatures that have been confirmed on the
    blockchain. It handles both TOS acceptances and allocation requests, applying
    them to the user's account once confirmed.

    The process includes:
    1. Checking TOS signatures:
        - Verifies signature confirmation
        - Prevents duplicate consent
        - Applies TOS acceptance
    2. Checking allocation signatures:
        - Verifies signature confirmation
        - Validates allocation details
        - Applies allocation request

    Returns:
        - 204: Signatures processed successfully
        - 500: Error processing signatures

    Note:
        - Only processes signatures during allocation window
        - Handles both TOS and allocation signatures
        - Marks signatures as approved or rejected
        - Logs all signature processing results
        - Client should call this endpoint periodically to check signature status
        - If this endpoint is not called, signatures will not be processed (until called)
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
