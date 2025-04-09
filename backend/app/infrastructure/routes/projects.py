from flask import current_app as app, request
from flask_restx import Namespace, fields

from app.extensions import api

from app.infrastructure import OctantResource
from app.modules.projects.metadata.controller import (
    get_projects_metadata,
)
from app.modules.projects.details import controller as projects_details_controller
from app.infrastructure.routes.validations.project_details_input import (
    validate_project_details_input,
)

ns = Namespace("projects", description="Octant projects")
api.add_namespace(ns)

projects_metadata_model = api.model(
    "ProjectsMetadata",
    {
        "projectsAddresses": fields.List(
            fields.String,
            required=True,
            description="Projects addresses",
        ),
        "projectsCid": fields.String(required=True, description="Projects CID"),
    },
)

project_model = api.model(
    "Project",
    {
        "name": fields.String(required=True, description="Project name"),
        "address": fields.String(required=True, description="Project address"),
        "epoch": fields.String(required=True, description="Project epoch"),
    },
)

projects_details_model = api.model(
    "ProjectsDetails",
    {
        "projectsDetails": fields.List(
            fields.Nested(project_model),
            required=False,
            description="Projects details",
        ),
    },
)


@ns.route("/epoch/<int:epoch>")
@ns.doc(
    description="Returns projects metadata for a given epoch: addresses and CID",
    params={
        "epoch": "Epoch number",
    },
)
class ProjectsMetadata(OctantResource):
    @ns.marshal_with(projects_metadata_model)
    @ns.response(200, "Projects metadata is successfully retrieved")
    def get(self, epoch):
        app.logger.debug(f"Getting projects metadata for epoch {epoch}")
        projects_metadata = get_projects_metadata(epoch)
        app.logger.debug(f"Projects metadata for epoch: {epoch}: {projects_metadata}")

        return {
            "projectsAddresses": projects_metadata.projects_addresses,
            "projectsCid": "bafybeifs53yk5oycvy5lu5r42oefk3vh7qkvfdkklkvaw2ocubmycgvche" if epoch == 7 else projects_metadata.projects_cid,
        }


@ns.route("/details")
@ns.doc(
    description="Returns projects details for a given epoch and searchPhrase.",
    params={
        "epochs": "Epochs numbers (query parameter)",
        "searchPhrases": "Search phrase (query parameter)",
    },
)
class ProjectsDetails(OctantResource):
    @ns.marshal_with(projects_details_model)
    @ns.response(200, "Projects metadata is successfully retrieved")
    def get(self):
        search_phrases = request.args.get("searchPhrases", "").split(",")
        epochs = validate_project_details_input(request.args.get("epochs", ""))

        app.logger.debug(
            f"Getting projects details for epochs {epochs} and search phrase {search_phrases}"
        )
        projects_details = (
            projects_details_controller.get_projects_details_for_multiple_params(
                epochs, search_phrases
            )
        )
        app.logger.debug(f"Projects details for epochs {epochs}: {projects_details}")

        return {
            "projectsDetails": [
                {
                    "name": project["name"],
                    "address": project["address"],
                    "epoch": project["epoch"],
                }
                for project in projects_details
            ]
        }
