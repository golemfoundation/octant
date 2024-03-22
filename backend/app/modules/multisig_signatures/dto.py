from dataclasses import dataclass
from enum import StrEnum

from dataclass_wizard import JSONWizard


@dataclass(frozen=True)
class Signature(JSONWizard):
    message: str
    hash: str
