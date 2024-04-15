from dataclasses import dataclass
from typing import List

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class Signature(JSONWizard):
    id: int
    message: str
    msg_hash: str
    safe_msg_hash: str
    user_address: str
    ip_address: str
    signature: str | None


@dataclass(frozen=True)
class ApprovedSignatureTypes:
    tos_signatures: List[Signature]
    allocation_signatures: List[Signature]
