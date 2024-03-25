from eth_account import Account
from eth_account.messages import encode_defunct, defunct_hash_message
from eth_keys.exceptions import BadSignature
from web3.exceptions import ContractLogicError

from app.legacy.crypto.account import is_contract
from app.legacy.crypto.eip1271 import is_valid_signature


def verify_signed_message(user_address: str, msg_text: str, signature: str) -> bool:
    if is_contract(user_address):
        return _verify_multisig(user_address, msg_text, signature)
    else:
        return _verify_eoa(user_address, msg_text, signature)


def hash_message(msg_text: str) -> str:
    return defunct_hash_message(text=msg_text).hex()


def _verify_multisig(user_address: str, msg_text: str, signature: str) -> bool:
    try:
        return is_valid_signature(user_address, msg_text, signature)
    except ContractLogicError:
        return False


def _verify_eoa(user_address: str, msg_text: str, signature: str) -> bool:
    encoded_msg = encode_defunct(text=msg_text)
    try:
        recovered_address = Account.recover_message(encoded_msg, signature=signature)
    except BadSignature:
        return False

    return recovered_address == user_address
