from __future__ import annotations

from typing import Annotated

from fastapi import Query, Path
from pydantic import field_validator

from v2.core.types import OctantModel


class PendingSignatureRequestV1(OctantModel):
    message: str


class PendingSignatureResponseV1(OctantModel):
    message: str | None
    hash: str | None
