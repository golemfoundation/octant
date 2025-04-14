from typing import Annotated

from fastapi import Depends

from v2.crypto.contracts import GNOSIS_SAFE, GnosisSafeContractsFactory, GnosisSafeContracts
from v2.crypto.signatures import SignedMessageVerifier
from v2.core.dependencies import Web3


def get_signed_message_verifier(w3: Web3) -> SignedMessageVerifier:
    return SignedMessageVerifier(w3)


def get_gnosis_safe_contracts_factory(w3: Web3) -> GnosisSafeContractsFactory:
    return GnosisSafeContractsFactory(w3)


GetGnosisSafeContractsFactory = Annotated[
    GnosisSafeContractsFactory, Depends(get_gnosis_safe_contracts_factory)
]

GetSignedMessageVerifier = Annotated[
    SignedMessageVerifier, Depends(get_signed_message_verifier)
]


