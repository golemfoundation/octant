from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    EPOCH = 1  # change corresponding to the epoch
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX, EPOCH)}"
    CID = [
        "QmSQEFD35gKxdPEmngNt1CWe3kSwiiGqBn1Z3FZvWb8mvK"
    ]  # change corresponding to the epoch
    GATEWAY_URL = "https://octant.infura-ipfs.io/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
