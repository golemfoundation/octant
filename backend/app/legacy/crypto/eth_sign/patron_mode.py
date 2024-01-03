from app.legacy.crypto.eth_sign.signature import verify_signed_message


def build_patron_mode_msg(user_address: str, toggle: bool) -> str:
    toggle_msg = "enable" if toggle else "disable"
    return f"Signing this message will {toggle_msg} patron mode for address {user_address}."


def verify(user_address: str, toggle: bool, signature: str) -> bool:
    msg_text = build_patron_mode_msg(user_address, toggle)

    return verify_signed_message(user_address, msg_text, signature)
