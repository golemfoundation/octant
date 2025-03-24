from functools import lru_cache
from typing import Annotated

import pandas as pd
from fastapi import Depends
from pydantic import Field

from app.constants import (
    SABLIER_INCORRECTLY_CANCELLED_STREAMS_IDS_SEPOLIA,
    INCORRECTLY_CANCELLED_STREAMS_PATH,
)
from app.shared.blockchain_types import ChainTypes
from v2.sablier.subgraphs import SablierSubgraph
from v2.core.dependencies import GetChainSettings, OctantSettings


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
def get_incorrectly_cancelled_streams_ids(chain_settings: GetChainSettings) -> set[int]:
    """
    Retrieve the set of incorrectly cancelled stream ids based on the chain type.
    """
    is_mainnet = chain_settings.chain_id == ChainTypes.MAINNET
    if is_mainnet:
        return set(
            pd.read_csv(INCORRECTLY_CANCELLED_STREAMS_PATH, sep=";")[
                "streamid"
            ].to_list()
        )

    return SABLIER_INCORRECTLY_CANCELLED_STREAMS_IDS_SEPOLIA


def get_sablier_subgraph(
    chain_settings: GetChainSettings,
    incorrectly_cancelled_streams_ids: Annotated[
        set[int], Depends(get_incorrectly_cancelled_streams_ids)
    ],
) -> SablierSubgraph:
    """
    Based on the chain type (mainnet or sepolia), return the appropriate SablierSubgraph.
    """

    sablier_settings = SablierSubgraphSettings()  # type: ignore[call-arg]

    if chain_settings.chain_id == ChainTypes.MAINNET:
        return SablierSubgraph(
            url=sablier_settings.sablier_mainnet_subgraph_url,
            sender=sablier_settings.sablier_sender_address,
            token_address=sablier_settings.sablier_token_address,
            incorrectly_cancelled_streams_ids=incorrectly_cancelled_streams_ids,
        )

    return SablierSubgraph(
        url=sablier_settings.sablier_sepolia_subgraph_url,
        sender=sablier_settings.sablier_sender_address_sepolia,
        token_address=sablier_settings.sablier_token_address_sepolia,
        incorrectly_cancelled_streams_ids=incorrectly_cancelled_streams_ids,
    )


GetSablierSubgraph = Annotated[
    SablierSubgraph,
    Depends(get_sablier_subgraph),
]
