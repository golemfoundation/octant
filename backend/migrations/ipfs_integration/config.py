from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    EPOCH = 10  # change corresponding to the epoch
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX, EPOCH)}"
    CID = [
        "bafybeihuno47auuimjjcit5ij2dojrzyvvy624f2qdch2krup63xqeteau"
    ]  # change corresponding to the epoch
    GATEWAY_URL = "https://turquoise-accused-gayal-88.mypinata.cloud/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
