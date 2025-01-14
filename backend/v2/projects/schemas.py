from __future__ import annotations
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

    def __hash__(self) -> int:
        """
        Compute a hash value for the object based on its fields.
        Used for distinctive objects in the searching routing.
        """
        return hash((self.name, self.address, self.epoch))

    def __eq__(self, other: ProjectModel) -> bool:
        """
        Compare two objects for equality based on their fields.
        Used for distinctive objects in the searching routing.
        """
        if not isinstance(other, ProjectModel):
            return NotImplemented
        return (
            self.name == other.name
            and self.address == other.address
            and self.epoch == other.epoch
        )


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
EpochNumberPath = Annotated[int, Path(..., description="Epoch number")]
