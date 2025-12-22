from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    EPOCH = 9  # change corresponding to the epoch
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX, EPOCH)}"
    CID = [
        "bafybeibxvsj7hmpw2o2hzevlp253adephzm44vgukdmkq7g4dxkw7gytw4"
    ]  # change corresponding to the epoch
    GATEWAY_URL = "https://turquoise-accused-gayal-88.mypinata.cloud/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
