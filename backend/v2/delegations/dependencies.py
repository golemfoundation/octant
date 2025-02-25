from typing import Annotated

from fastapi import Depends
from v2.delegations.services import DelegationService
from v2.core.dependencies import GetSession, OctantSettings


class DelegationSettings(OctantSettings):
    delegation_salt_primary: str
    delegation_salt: str


def get_delegation_settings() -> DelegationSettings:
    return DelegationSettings()


def get_delegation_service(
    session: GetSession,
    settings: Annotated[DelegationSettings, Depends(get_delegation_settings)],
) -> DelegationService:
    return DelegationService(
        session=session,
        salt_primary=settings.delegation_salt_primary,
        salt_secondary=settings.delegation_salt,
    )


GetDelegationService = Annotated[DelegationService, Depends(get_delegation_service)]
