from typing import Annotated

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings
from v2.projects.services import EstimatedProjectMatchedRewards
from v2.epochs.dependencies import get_epochs_subgraph
from v2.epochs.subgraphs import EpochsSubgraph
from v2.projects.contracts import ProjectsContracts
from v2.projects.depdendencies import (
    get_estimated_project_matched_rewards,
    get_projects_contracts,
)
from v2.uniqueness_quotients.dependencies import get_uq_score_getter
from v2.uniqueness_quotients.services import UQScoreGetter
from v2.core.dependencies import GetSession, OctantSettings

from .services import Allocations
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
    epochs_subgraph: Annotated[EpochsSubgraph, Depends(get_epochs_subgraph)],
    projects_contracts: Annotated[ProjectsContracts, Depends(get_projects_contracts)],
    settings: Annotated[SignatureVerifierSettings, Depends(get_signature_verifier_settings)],
) -> SignatureVerifier:
    return SignatureVerifier(
        session, epochs_subgraph, projects_contracts, settings.chain_id
    )

GetSignatureVerifier = Annotated[
    SignatureVerifier,
    Depends(get_signature_verifier)
]


def get_allocations(
    session: GetSession,
    signature_verifier: GetSignatureVerifier,
    uq_score_getter: Annotated[UQScoreGetter, Depends(get_uq_score_getter)],
    projects: Annotated[ProjectsContracts, Depends(get_projects_contracts)],
    estimated_project_matched_rewards: Annotated[
        EstimatedProjectMatchedRewards, Depends(get_estimated_project_matched_rewards)
    ],
) -> Allocations:
    return Allocations(
        session,
        signature_verifier,
        uq_score_getter,
        projects,
        estimated_project_matched_rewards,
    )


GetAllocations = Annotated[
    Allocations,
    Depends(get_allocations)
]