from dataclasses import dataclass
from enum import StrEnum

from dataclass_wizard import JSONWizard


class SignatureOpType(StrEnum):
    TOS = "tos"
    ALLOCATION = "allocation"


@dataclass(frozen=True)
class Signature(JSONWizard):
    message: str
    hash: str
