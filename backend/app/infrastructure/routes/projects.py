from flask import current_app as app
from flask_restx import Namespace, fields

from app.extensions import api
from app.extensions import cache
from app.infrastructure import OctantResource
from app.modules.projects.controller import (
    get_projects_metadata,
)

ns = Namespace("projects", description="Octant projects")
api.add_namespace(ns)

projects_metadata_model = api.model(
    "ProjectsMetadata",
    {
        "projects_addresses": fields.List(
            fields.String,
            required=True,
            description="Projects addresses",
        ),
        "projects_cid": fields.String(required=True, description="Projects CID"),
    },
)


@ns.route("/epoch/<int:epoch>")
@ns.doc(
    description="Returns projects metadata for a given epoch: addresses and CID",
    params={
        "epoch": "Epoch number",
    },
)
class ProposalsProjectsMetadata(OctantResource):
    @ns.marshal_with(projects_metadata_model)
    @ns.response(200, "Projects metadata is successfully retrieved")
    # The calls to the contracts might be time-consuming. Update once in a minute.
    # @cache.cached(timeout=60)
    def get(self, epoch):
        app.logger.debug(f"Getting projects metadata for epoch {epoch}")
        projects_metadata = get_projects_metadata(epoch)
        app.logger.debug(f"Projects metadata for epoch: {epoch}: {projects_metadata}")

        return {
            "projects_addresses": projects_metadata.projects_addresses,
            "projects_cid": projects_metadata.proposals_cid,
        }