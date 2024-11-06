from app.modules.common.crypto.signature import encode_for_signing, EncodingStandardFor, verify_signed_message


def build_patron_mode_msg(user_address: str, toggle: bool) -> str:
    toggle_msg = "enable" if toggle else "disable"
    return f"Signing this message will {toggle_msg} patron mode for address {user_address}."


def verify(user_address: str, toggle: bool, signature: str) -> bool:
    msg_text = build_patron_mode_msg(user_address, toggle)

    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)

    return verify_signed_message(user_address, encoded_msg, signature)
