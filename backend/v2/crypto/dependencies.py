from typing import Annotated

from fastapi import Depends

from v2.crypto.signatures import SignedMessageVerifier
from v2.core.dependencies import Web3


def get_signed_message_verifier(w3: Web3) -> SignedMessageVerifier:
    return SignedMessageVerifier(w3)


GetSignedMessageVerifier = Annotated[
    SignedMessageVerifier, Depends(get_signed_message_verifier)
]
