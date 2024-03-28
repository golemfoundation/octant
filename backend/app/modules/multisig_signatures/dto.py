from dataclasses import dataclass

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class Signature(JSONWizard):
    id: int
    message: str
    hash: str


@dataclass(frozen=True)
class ApprovedSignatureTypes:
    tos_signatures: list[Signature]
    allocation_signatures: list[Signature]
