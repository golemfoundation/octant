from flask import current_app as app

from typing import List
from app.modules.common.string_utils import parse_cids_to_epochs_dict
from app.modules.dto import ProjectsMetadata
from app.extensions import projects
from app.context.manager import Context
from app.pydantic import Model


class StaticProjectsMetadataService(Model):
    def get_projects_metadata(
        self, context: Context, is_mainnet: bool
    ) -> ProjectsMetadata:
        projects_cid: str

        if is_mainnet:
            epoch_to_cid_dict: dict[int, str] = parse_cids_to_epochs_dict(
                app.config["MAINNET_PROJECT_CIDS"]
            )
            projects_cid = (
                projects.get_project_cid()
                if context.epoch_details.epoch_num not in epoch_to_cid_dict
                else epoch_to_cid_dict[context.epoch_details.epoch_num]
            )
        else:
            projects_cid = projects.get_project_cid()

        app.logger.debug(f"projects_cid {projects_cid}")
        projects_address_list: List[str] = projects.get_project_addresses(
            context.epoch_details.epoch_num
        )
        app.logger.debug(f"projects_address_list {projects_address_list}")
        return ProjectsMetadata(projects_cid, projects_address_list)
