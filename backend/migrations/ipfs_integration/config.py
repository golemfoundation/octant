from enum import StrEnum

from core import build_filename


class Config:
    FILENAME_PREFIX = "ipfs_projects_details"
    JSON_FILEPATH = f"files/{build_filename(FILENAME_PREFIX)}"
    CIDS = ["QmSXcT18anMXKACTueom8GXw8zrxTBbHGB71atitf6gZ9V"]
    GATEWAY_URL = "https://octant.infura-ipfs.io/ipfs/"


class ProjectDetails(StrEnum):
    NAME = "name"
