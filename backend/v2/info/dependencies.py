from typing import Annotated

from fastapi import Depends
from v2.core.dependencies import OctantSettings
from v2.core.types import Address


class AuthSettings(OctantSettings):
    auth_contract_address: Address


def get_auth_settings() -> AuthSettings:
    return AuthSettings()


GetAuthSettings = Annotated[AuthSettings, Depends(get_auth_settings)]
