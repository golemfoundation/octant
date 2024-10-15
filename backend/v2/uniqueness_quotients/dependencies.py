from decimal import Decimal
from typing import Annotated

from app.constants import (
    GUEST_LIST,
    TIMEOUT_LIST,
    TIMEOUT_LIST_NOT_MAINNET,
    UQ_THRESHOLD_MAINNET,
    UQ_THRESHOLD_NOT_MAINNET,
)
from app.shared.blockchain_types import ChainTypes
from fastapi import Depends
from pydantic import Field, TypeAdapter
from v2.core.types import Address
from v2.core.dependencies import GetChainSettings, GetSession, OctantSettings

from .services import UQScoreGetter


class UQScoreSettings(OctantSettings):
    uq_score_threshold: float = Field(
        default=15.0,
        description="The Gitcoin Passport score threshold above which the UQ score is set to the maximum UQ score.",
    )
    low_uq_score: Decimal = Field(
        default=Decimal("0.01"),
        description="The UQ score to be returned if the Gitcoin Passport score is below the threshold.",
    )
    max_uq_score: Decimal = Field(
        default=Decimal("1.0"),
        description="The UQ score to be returned if the Gitcoin Passport score is above the threshold.",
    )
    null_uq_score: Decimal = Field(
        default=Decimal("0.0"),
        description="The UQ score to be returned if the user is on the timeout list.",
    )


def get_uq_score_settings() -> UQScoreSettings:
    return UQScoreSettings()


def get_uq_score_getter(
    session: GetSession,
    settings: Annotated[UQScoreSettings, Depends(get_uq_score_settings)],
    chain_settings: GetChainSettings,
) -> UQScoreGetter:
    # TODO: this should be a much nicer dependency :)
    is_mainnet = chain_settings.chain_id == ChainTypes.MAINNET

    uq_threshold = UQ_THRESHOLD_MAINNET if is_mainnet else UQ_THRESHOLD_NOT_MAINNET
    timeout_list = TIMEOUT_LIST if is_mainnet else TIMEOUT_LIST_NOT_MAINNET

    address_set_validator = TypeAdapter(set[Address])
    timeout_set = address_set_validator.validate_python(timeout_list)
    guest_set = address_set_validator.validate_python(GUEST_LIST)

    return UQScoreGetter(
        session=session,
        uq_score_threshold=uq_threshold,
        max_uq_score=settings.max_uq_score,
        low_uq_score=settings.low_uq_score,
        null_uq_score=settings.null_uq_score,
        guest_list=guest_set,
        timeout_list=timeout_set,
    )


GetUQScoreGetter = Annotated[UQScoreGetter, Depends(get_uq_score_getter)]
