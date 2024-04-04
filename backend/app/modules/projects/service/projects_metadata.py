from flask import current_app as app

from typing import List
from app.modules.dto import ProjectsMetadata
from app.legacy.core.proposals import get_proposals_addresses, get_proposals_cid
from app.context.manager import Context
from app.pydantic import Model

MAINNET_PROPOSAL_CIDS: dict[int, str] = {
    1: "QmSQEFD35gKxdPEmngNt1CWe3kSwiiGqBn1Z3FZvWb8mvK",
    2: "Qmds9N5y2vkMuPTD6M4EBxNXnf3bjTDmzWBGnCkQGsMMGe",
    # 3: "QmWSqxAqGm7SPzdRv5wHLwZ9JeYb5XkHwfaHHMNWNBE8Wh",
}


class StaticProjectsMetadataService(Model):
    def get_projects_metadata(self, context: Context) -> int:
        if context.epoch_details.epoch_num == 0:
            return ProjectsMetadata("", [])

        proposals_cid: str = (
            get_proposals_cid()
            if context.epoch_details.epoch_num not in MAINNET_PROPOSAL_CIDS
            else MAINNET_PROPOSAL_CIDS[context.epoch_details.epoch_num]
        )
        app.logger.debug(f"proposals_cid {proposals_cid}")
        proposals_address_list: List[str] = get_proposals_addresses(
            context.epoch_details.epoch_num
        )
        app.logger.debug(f"proposals_address_list {proposals_address_list}")
        return ProjectsMetadata(proposals_cid, proposals_address_list)
