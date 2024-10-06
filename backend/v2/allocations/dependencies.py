from typing import Annotated

from fastapi import Depends
from pydantic import Field
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimator
from v2.project_rewards.services import ProjectRewardsEstimator
from v2.core.exceptions import AllocationWindowClosed
from v2.epochs.dependencies import (
    AssertAllocationWindowOpen,
    GetEpochsContracts,
    GetEpochsSubgraph,
)
from v2.projects.dependencies import (
    GetProjectsContracts,
)
from v2.uniqueness_quotients.dependencies import GetUQScoreGetter
from v2.core.dependencies import GetSession, OctantSettings

from .services import Allocator
from .validators import SignatureVerifier


class SignatureVerifierSettings(OctantSettings):
    chain_id: int = Field(
        default=11155111,
        description="The chain id to use for the signature verification.",
    )


def get_signature_verifier_settings() -> SignatureVerifierSettings:
    return SignatureVerifierSettings()


def get_signature_verifier(
    session: GetSession,
    epochs_subgraph: GetEpochsSubgraph,
    projects_contracts: GetProjectsContracts,
    settings: Annotated[
        SignatureVerifierSettings, Depends(get_signature_verifier_settings)
    ],
) -> SignatureVerifier:
    return SignatureVerifier(
        session, epochs_subgraph, projects_contracts, settings.chain_id
    )


GetSignatureVerifier = Annotated[SignatureVerifier, Depends(get_signature_verifier)]


async def get_allocator(
    epoch_number: AssertAllocationWindowOpen,
    session: GetSession,
    signature_verifier: GetSignatureVerifier,
    uq_score_getter: GetUQScoreGetter,
    projects_contracts: GetProjectsContracts,
    matched_rewards_estimator: GetMatchedRewardsEstimator,
) -> Allocator:
    return Allocator(
        session,
        signature_verifier,
        uq_score_getter,
        projects_contracts,
        matched_rewards_estimator,
        epoch_number,
    )


GetAllocator = Annotated[Allocator, Depends(get_allocator)]
