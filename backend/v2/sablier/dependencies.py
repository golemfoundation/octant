from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from pydantic import Field
from pydantic_settings import SettingsConfigDict
from app.shared.blockchain_types import ChainTypes
from v2.sablier.subgraphs import SablierSubgraph
from v2.core.dependencies import GetChainSettings, GetSession, OctantSettings
from v2.epochs.dependencies import GetOpenAllocationWindowEpochNumber
from v2.matched_rewards.dependencies import GetMatchedRewardsEstimator
from v2.project_rewards.services import ProjectRewardsEstimator
from v2.projects.dependencies import GetProjectsContracts


class SablierSubgraphSettings(OctantSettings):
    # For mainnet
    sablier_mainnet_subgraph_url: str
    sablier_token_address: str = Field(
        default="0x7DD9c5Cba05E151C895FDe1CF355C9A1D5DA6429",
        alias="GLM_TOKEN_ADDRESS",
    )
    sablier_sender_address: str = ""
    # For sepolia
    sablier_sepolia_subgraph_url: str
    sablier_token_address_sepolia: str = "0x71432dd1ae7db41706ee6a22148446087bdd0906"
    sablier_sender_address_sepolia: str = "0xf86fD85672683c220709B9ED80bAD7a51800206a"


@lru_cache(maxsize=1)
def get_sablier_subgraph(chain_settings: GetChainSettings) -> SablierSubgraph:
    """
    Based on the chain type (mainnet or sepolia), return the appropriate SablierSubgraph.
    """

    sablier_settings = SablierSubgraphSettings()

    if chain_settings.chain_id == ChainTypes.MAINNET:
        return SablierSubgraph(
            sablier_settings.sablier_mainnet_subgraph_url,
            sablier_settings.sablier_sender_address,
            sablier_settings.sablier_token_address,
        )

    return SablierSubgraph(
        sablier_settings.sablier_sepolia_subgraph_url,
        sablier_settings.sablier_sender_address_sepolia,
        sablier_settings.sablier_token_address_sepolia,
    )

GetSablierSubgraph = Annotated[
    SablierSubgraph,
    Depends(get_sablier_subgraph),
]
