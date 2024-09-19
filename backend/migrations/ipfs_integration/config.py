from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    EPOCH = 4  # change corresponding to the epoch
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX, EPOCH)}"
    CID = [
        "QmZYttFQ46XPZWxFuDoRv4rtNYiu7DA1jxdrJTgop4TmD5"
    ]  # change corresponding to the epoch
    GATEWAY_URL = "https://octant.infura-ipfs.io/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
