from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    EPOCH = 6  # change corresponding to the epoch
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX, EPOCH)}"
    CID = [
        "bafybeidwpmlamodnqonogpyl2kgvtqe3p7ig74ilhxjy3a2jjbfv5zfg54"
    ]  # change corresponding to the epoch
    GATEWAY_URL = "https://octant.infura-ipfs.io/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
