from app.legacy.crypto.eth_sign.signature import verify_signed_message


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


def verify(user_address: str, signature: str) -> bool:
    msg_text = build_consent_message(user_address)

    return verify_signed_message(user_address, msg_text, signature)
