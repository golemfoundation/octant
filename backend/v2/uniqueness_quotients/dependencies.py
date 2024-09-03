from decimal import Decimal
from typing import Annotated
from fastapi import Depends

from pydantic import Field
from pydantic_settings import BaseSettings

from v2.core.dependencies import AsyncDbSession
from .services import UQScoreGetter


class UQScoreSettings(BaseSettings):
    uq_score_threshold: float = Field(
        default=21.0,
        description="The Gitcoin Passport score threshold above which the UQ score is set to the maximum UQ score.",
    )
    low_uq_score: Decimal = Field(
        default=Decimal("0.2"),
        description="The UQ score to be returned if the Gitcoin Passport score is below the threshold.",
    )
    max_uq_score: Decimal = Field(
        default=Decimal("1.0"),
        description="The UQ score to be returned if the Gitcoin Passport score is above the threshold.",
    )


def get_uq_score_getter(
    session: AsyncDbSession,
    settings: Annotated[UQScoreSettings, Depends(UQScoreSettings)],
) -> UQScoreGetter:
    return UQScoreGetter(
        session=session,
        uq_score_threshold=settings.uq_score_threshold,
        max_uq_score=settings.max_uq_score,
        low_uq_score=settings.low_uq_score,
    )
