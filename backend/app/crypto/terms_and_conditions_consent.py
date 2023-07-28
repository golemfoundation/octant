from eth_account.account import Account
from eth_account.messages import encode_defunct
from eth_keys.exceptions import BadSignature


def build_consent_message(user_address: str) -> str:
    return "\n".join(
        (
            "Welcome to Octant.",
            "Please click to sign in and accept the Octant Terms of Service.",
            "",
            "Signing this message will not trigger a transaction.",
            "",
            "Your address",
            user_address,
        )
    )


def verify_signed_message(user_address: str, signature: str) -> bool:
    msg_text = build_consent_message(user_address)
    message = encode_defunct(text=msg_text)
    try:
        recovered_address = Account.recover_message(message, signature=signature)
    except BadSignature:
        return False

    return recovered_address == user_address
