from typing import Annotated

from fastapi import Query, Path
from pydantic import field_validator

from v2.core.types import OctantModel


class ProjectModel(OctantModel):
    name: str
    address: str
    epoch: str

    @field_validator("epoch", mode="before")
    def convert_epoch_to_str(cls, value):
        """Ensure epoch is always a string."""
        return str(value)


class ProjectsMetadataResponseV1(OctantModel):
    projects_addresses: list[str]
    projects_cid: str


class ProjectsDetailsResponseV1(OctantModel):
    projects_details: list[ProjectModel]


EpochsParameter = Annotated[
    str, Query(..., description="Comma-separated list of epoch numbers")
]
SearchPhrasesParameter = Annotated[
    str, Query(..., alias="searchPhrases", description="Comma-separated search phrases")
]
EpochNumberPath = Annotated[str, Path(..., description="Epoch number")]
