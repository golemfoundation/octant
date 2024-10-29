from typing import Annotated

from fastapi import Depends
from v2.allocations.services import Allocator
from v2.allocations.validators import SignatureVerifier
from v2.core.dependencies import GetChainSettings, GetSession
from v2.epochs.dependencies import GetEpochsSubgraph, GetOpenAllocationWindowEpochNumber
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimator
from v2.projects.dependencies import GetProjectsContracts
from v2.uniqueness_quotients.dependencies import GetUQScoreGetter


def get_signature_verifier(
    session: GetSession,
    epochs_subgraph: GetEpochsSubgraph,
    projects_contracts: GetProjectsContracts,
    settings: GetChainSettings,
) -> SignatureVerifier:
    return SignatureVerifier(
        session, epochs_subgraph, projects_contracts, settings.chain_id
    )


GetSignatureVerifier = Annotated[SignatureVerifier, Depends(get_signature_verifier)]


async def get_allocator(
    epoch_number: GetOpenAllocationWindowEpochNumber,
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
