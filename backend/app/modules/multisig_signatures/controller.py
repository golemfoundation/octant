from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class Signature(JSONWizard):
    message: str
    hash: str


def get_last_pending_signature(user_address: str, op_type) -> Signature:
    return Signature(message="message", hash="hash")


def save_pending_signature(user_address: str, op_type, signature_data: dict):
    signature = Signature.from_dict(signature_data)
    ...
