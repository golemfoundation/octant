from app.modules.common.signature import (
    verify_signed_message,
    encode_for_signing,
    EncodingStandardFor,
)


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


def verify_signature(user_address: str, signature: str) -> bool:
    msg_text = build_consent_message(user_address)
    encoded_msg = encode_for_signing(EncodingStandardFor.TEXT, msg_text)

    return verify_signed_message(user_address, encoded_msg, signature)
