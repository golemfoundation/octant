"""
GLM token management endpoints for handling GLM claims and balances.

This module provides endpoints for managing GLM tokens, specifically for the epoch 0
claiming process. It handles the verification and processing of GLM claims from eligible
accounts.

Key Concepts:
    - GLM: The native token of the Golem Network
    - Epoch 0 Claims: Special GLM distribution for eligible accounts from epoch 0
    - Claim Eligibility: Determined by presence in the database
    - Claim Process:
        - User signs EIP-712 message
        - System verifies eligibility
        - System checks if already claimed
        - System assigns claim nonce
        - System marks claim as processed

    - Security Features:
        - EIP-712 signature verification
        - Nonce tracking for claims
        - Claim status tracking
        - Configurable claim enabling/disabling

    - Claim States:
        - Eligible: User found in database, not yet claimed
        - Claimed: User has already claimed their GLMs
        - Ineligible: User not found in database
        - Disabled: GLM claiming is currently disabled
"""

from fastapi import APIRouter, Response, status
from app.exceptions import GlmClaimed, NotEligibleToClaimGLM
from app.modules.common.crypto.signature import (
    EncodingStandardFor,
    encode_for_signing,
)
from v2.crypto.eip712 import build_claim_glm_eip712_data
from v2.glms.dependencies import GetGLMSettings
from v2.glms.repositories import get_claimable_glms, get_highest_claim_nonce
from v2.glms.schemas import CheckClaimGLMResponseV1, ClaimGLMRequestV1
from v2.core.dependencies import GetChainSettings, GetSession, Web3
from v2.core.types import Address

from v2.core.transformers import transform_to_checksum_address

api = APIRouter(prefix="/glms", tags=["GLMs"])


@api.post("/claim", status_code=status.HTTP_201_CREATED)
async def claim_glms_v1(
    response: Response,
    session: GetSession,
    chain_settings: GetChainSettings,
    glm_settings: GetGLMSettings,
    w3: Web3,
    claim_request: ClaimGLMRequestV1,
) -> None:
    """
    Claim GLMs from epoch 0. Only eligible accounts are able to claim.

    This endpoint processes GLM claims from epoch 0. It verifies the user's eligibility,
    checks if they have already claimed, and processes the claim if valid. The process
    includes:
    1. Verifying GLM claiming is enabled
    2. Recovering user address from EIP-712 signature
    3. Determining claim nonce
    4. Checking eligibility and claim status
    5. Marking claim as processed

    Request Body:
        - signature: EIP-712 signature of the claim message
            Format: {'msg': 'Claim <AMOUNT-TO-CLAIM-IN-ETHER> GLMs'}

    Returns:
        - 201: GLMs claimed successfully
        - 404: User address not found in db - user is not eligible to claim GLMs
        - 403: GLM claiming is disabled
        - 400: GLMs have been already claimed

    Note:
        - Only works for epoch 0 claims
        - Requires valid EIP-712 signature
        - Uses sequential nonce for claim tracking
        - Can be disabled via settings
    """

    if not glm_settings.glm_claim_enabled:
        return Response(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "GLM claiming is disabled"},
        )

    # Recover the user address from EIP-712 structured data
    eip712_data = build_claim_glm_eip712_data(
        chain_settings.chain_id,
        glm_settings.glm_withdrawal_amount,
    )
    user_address = w3.eth.account.recover_message(
        encode_for_signing(EncodingStandardFor.DATA, eip712_data),
        signature=claim_request.signature,
    )
    address = transform_to_checksum_address(user_address)

    # Figure out the nonce
    last_nonce = await get_highest_claim_nonce(session)
    nonce = glm_settings.glm_sender_nonce if last_nonce is None else last_nonce + 1

    # Check eligibility
    user_claim = await get_claimable_glms(session, address)
    if user_claim is None:
        raise NotEligibleToClaimGLM(address)

    if user_claim.claimed:
        raise GlmClaimed(address)

    # Mark as claimed and set the nonce
    user_claim.claimed = True
    user_claim.claim_nonce = nonce

    await session.commit()


@api.get("/claim/{user_address}/check")
async def check_claim_glms_v1(
    session: GetSession,
    glm_settings: GetGLMSettings,
    user_address: Address,
) -> CheckClaimGLMResponseV1:
    """
    Check if account is eligible to claim GLMs from epoch 0.

    This endpoint verifies if a user is eligible to claim GLMs from epoch 0 and
    returns the claimable amount. It checks:
    1. If GLM claiming is enabled
    2. If the user is in the eligible accounts database
    3. If the user has already claimed their GLMs

    Path Parameters:
        - user_address: The Ethereum address to check eligibility for

    Returns:
        CheckClaimGLMResponseV1 containing:
            - address: The checked user address
            - claimable: Amount of GLMs that can be claimed (in WEI)
                - 0 if already claimed
                - Full amount if eligible and not claimed
                - 0 if ineligible

    Status Codes:
        - 200: Account is eligible to claim GLMs
        - 404: User address not found in db - user is not eligible to claim GLMs
        - 403: Claiming GLMs is disabled
        - 400: GLMs have been already claimed

    Note:
        - Only works for epoch 0 claims
        - Returns 0 for ineligible or already claimed addresses
        - Can be disabled via settings
    """

    if not glm_settings.glm_claim_enabled:
        return Response(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": "GLM claiming is disabled"},
        )

    user_claim = await get_claimable_glms(session, user_address)
    if user_claim is None:
        raise NotEligibleToClaimGLM(user_address)

    # if user has already claimed GLMs, return 0
    claimable = glm_settings.glm_withdrawal_amount if not user_claim.claimed else 0

    return CheckClaimGLMResponseV1(
        address=user_address,
        claimable=claimable,
    )
