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

    Returns:
        - 201: GLMs claimed successfully
        - 404: User address not found in db - user is not eligible to claim GLMs
        - 403: GLM claiming is disabled
        - 400: GLMs have been already claimed
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
    Check if account is eligible are able to claim GLMs from epoch 0. Return number of GLMs in wei

    Returns:
        - 200: Account is eligible to claim GLMs
        - 404: User address not found in db - user is not eligible to claim GLMs
        - 403: Claiming GLMs is disabled
        - 400: GLMs have been already claimed
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
