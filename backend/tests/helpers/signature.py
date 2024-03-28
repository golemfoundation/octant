from eth_account.messages import encode_defunct

from app.modules.user.tos.core import build_consent_message


def build_user_signature(user, user_address=None):
    if user_address is None:
        user_address = user.address

    msg = build_consent_message(user_address)
    message = encode_defunct(text=msg)
    signature_bytes = user.sign_message(message).signature

    return signature_bytes
