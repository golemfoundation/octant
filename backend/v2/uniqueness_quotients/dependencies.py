from decimal import Decimal
from typing import Annotated

from app.constants import (
    GC_PASSPORT_SCORER_API,
    GUEST_LIST,
    TIMEOUT_LIST,
    TIMEOUT_LIST_NOT_MAINNET,
    UQ_THRESHOLD_MAINNET,
    UQ_THRESHOLD_NOT_MAINNET,
    GUEST_LIST_NOT_MAINNET,
)
from app.shared.blockchain_types import ChainTypes
from fastapi import Depends
from pydantic import Field, TypeAdapter
from v2.uniqueness_quotients.gitcoin_passport import GitcoinScorerClient
from v2.core.dependencies import GetChainSettings, GetSession, OctantSettings
from v2.core.types import Address
from v2.uniqueness_quotients.services import UQScoreGetter


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


def get_timeout_list(chain_settings: GetChainSettings) -> set[Address]:
    is_mainnet = chain_settings.chain_id == ChainTypes.MAINNET
    timeout_list = TIMEOUT_LIST if is_mainnet else TIMEOUT_LIST_NOT_MAINNET
    return TypeAdapter(set[Address]).validate_python(timeout_list)


def get_uq_score_getter(
    session: GetSession,
    settings: Annotated[UQScoreSettings, Depends(get_uq_score_settings)],
    chain_settings: GetChainSettings,
    timeout_list: Annotated[set[Address], Depends(get_timeout_list)],
) -> UQScoreGetter:
    # TODO: this should be a much nicer dependency :)
    is_mainnet = chain_settings.chain_id == ChainTypes.MAINNET

    uq_threshold = UQ_THRESHOLD_MAINNET if is_mainnet else UQ_THRESHOLD_NOT_MAINNET

    address_set_validator = TypeAdapter(set[Address])

    if is_mainnet:
        guest_set = address_set_validator.validate_python(GUEST_LIST)
    else:
        guest_set = address_set_validator.validate_python(GUEST_LIST_NOT_MAINNET)

    return UQScoreGetter(
        session=session,
        uq_score_threshold=uq_threshold,
        max_uq_score=settings.max_uq_score,
        low_uq_score=settings.low_uq_score,
        null_uq_score=settings.null_uq_score,
        guest_list=guest_set,
        timeout_list=timeout_list,
    )


class GitcoinScorerSettings(OctantSettings):
    gc_passport_scorer_api_key: str
    gc_passport_scorer_id: str
    gc_passport_scorer_base_url: str = GC_PASSPORT_SCORER_API


def get_gitcoin_scorer_settings() -> GitcoinScorerSettings:
    return GitcoinScorerSettings()


def get_gitcoin_scorer_client(
    settings: Annotated[GitcoinScorerSettings, Depends(get_gitcoin_scorer_settings)]
) -> GitcoinScorerClient:
    return GitcoinScorerClient(
        api_key=settings.gc_passport_scorer_api_key,
        scorer_id=settings.gc_passport_scorer_id,
        base_url=settings.gc_passport_scorer_base_url,
    )


GetUQScoreGetter = Annotated[UQScoreGetter, Depends(get_uq_score_getter)]
GetGitcoinScorerClient = Annotated[
    GitcoinScorerClient, Depends(get_gitcoin_scorer_client)
]
GetTimeoutList = Annotated[set[Address], Depends(get_timeout_list)]
