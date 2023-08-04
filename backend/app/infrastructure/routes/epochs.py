from flask import current_app as app
from flask_restx import fields, Namespace, Resource

from app.infrastructure import OctantResource
from app.controllers import epochs
from app.extensions import api

ns = Namespace("epochs", description="Octant epochs")
api.add_namespace(ns)

current_epoch_model = api.model(
    "CurrentEpoch",
    {
        "currentEpoch": fields.Integer(
            required=True, description="Current epoch number"
        ),
    },
)


@ns.route("/current")
@ns.doc(description="Returns current epoch number")
class CurrentEpoch(OctantResource):
    @ns.marshal_with(current_epoch_model)
    @ns.response(200, "Current epoch successfully retrieved")
    def get(self):
        app.logger.debug("Getting current epoch number")
        current_epoch = epochs.get_current_epoch()
        app.logger.debug(f"Current epoch number: {current_epoch}")

        return {"currentEpoch": current_epoch}
