from flask import current_app as app

from typing import List
from app.modules.common.string_utils import parse_cids_to_epochs_dict
from app.modules.dto import ProjectsMetadata
from app.legacy.core.proposals import get_proposals_addresses, get_proposals_cid
from app.context.manager import Context
from app.pydantic import Model


class StaticProjectsMetadataService(Model):
    def get_projects_metadata(self, context: Context) -> ProjectsMetadata:
        if context.epoch_details.epoch_num == 0:
            return ProjectsMetadata("", [])

        epoch_to_cid_dict: dict[int, str] = parse_cids_to_epochs_dict(
            app.config["MAINNET_PROPOSAL_CIDS"]
        )
        proposals_cid: str = (
            get_proposals_cid()
            if context.epoch_details.epoch_num not in epoch_to_cid_dict
            else epoch_to_cid_dict[context.epoch_details.epoch_num]
        )
        app.logger.debug(f"proposals_cid {proposals_cid}")
        proposals_address_list: List[str] = get_proposals_addresses(
            context.epoch_details.epoch_num
        )
        app.logger.debug(f"proposals_address_list {proposals_address_list}")
        return ProjectsMetadata(proposals_cid, proposals_address_list)
