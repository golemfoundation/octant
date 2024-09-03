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
from v2.core.dependencies import AsyncDbSession

from .services import Allocations
from .validators import SignatureVerifier


class SignatureVerifierSettings(BaseSettings):
    chain_id: int = Field(
        default=11155111,
        description="The chain id to use for the signature verification.",
    )


def get_signature_verifier(
    session: AsyncDbSession,
    epochs_subgraph: Annotated[EpochsSubgraph, Depends(get_epochs_subgraph)],
    projects_contracts: Annotated[ProjectsContracts, Depends(get_projects_contracts)],
    settings: Annotated[SignatureVerifierSettings, Depends(SignatureVerifierSettings)],
) -> SignatureVerifier:
    return SignatureVerifier(
        session, epochs_subgraph, projects_contracts, settings.chain_id
    )


def get_allocations(
    session: AsyncDbSession,
    signature_verifier: SignatureVerifier,
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
