"""
Handles signatures from two types of signers (EOA and smart contracts),
for two different formats of signed message.

First is known as `personal_sign` (known as EIP-191, version E) and signs strings is a safe way.
Second one (EIP-1271) is used for signing structured data and builds on top of the first one.
"""
from enum import StrEnum
from typing import Union, Dict

from eth_account import Account
from eth_account.messages import (
    SignableMessage,
    _hash_eip191_message,
    encode_defunct,
    encode_structured_data,
)
from eth_keys.exceptions import BadSignature
from web3.exceptions import ContractLogicError

from app.legacy.crypto.account import is_contract
from app.legacy.crypto.eip1271 import is_valid_signature


class EncodingStandardFor(StrEnum):
    TEXT = "eip191"
    DATA = "eip1271"


def verify_signed_message(
    user_address: str, encoded_msg: SignableMessage, signature: str
) -> bool:
    contract = is_contract(user_address)
    if contract:
        return _verify_multisig(user_address, encoded_msg, signature)
    else:
        return _verify_eoa(user_address, encoded_msg, signature)


def encode_for_signing(
    standard: EncodingStandardFor, message: Union[str | Dict]
) -> SignableMessage:
    if standard == EncodingStandardFor.DATA:
        return encode_structured_data(message)
    if standard == EncodingStandardFor.TEXT:
        return encode_defunct(text=message)
    raise ValueError(standard)


def hash_signable_message(encoded_msg: SignableMessage) -> str:
    return "0x" + _hash_eip191_message(encoded_msg).hex()


def _verify_multisig(
    user_address: str, encoded_msg: SignableMessage, signature: str
) -> bool:
    msg_hash = hash_signable_message(encoded_msg)
    try:
        return is_valid_signature(user_address, msg_hash, signature)
    except ContractLogicError:
        return False


def _verify_eoa(
    user_address: str, encoded_msg: SignableMessage, signature: str
) -> bool:
    try:
        recovered_address = Account.recover_message(encoded_msg, signature=signature)
    except BadSignature:
        return False
    return recovered_address == user_address
