from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    EPOCH = 9  # change corresponding to the epoch
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX, EPOCH)}"
    CID = [
        "bafybeihar7fssu3rkn4h2ngphw4e2qudqbhfip473f6lyi6zf5flueustu"
    ]  # change corresponding to the epoch
    GATEWAY_URL = "https://turquoise-accused-gayal-88.mypinata.cloud/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
