from flask import current_app as app
from flask_restx import fields, Namespace

from app.controllers import epochs
from app.extensions import api
from app.infrastructure import OctantResource, graphql

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


indexed_epoch_model = api.model(
    "IndexedEpoch",
    {
        "currentEpoch": fields.Integer(
            required=True, description="Current epoch number"
        ),
        "indexedEpoch": fields.Integer(
            required=True, description="Indexed epoch number"
        ),
    },
)


@ns.route("/indexed")
@ns.doc(description="Returns last indexed epoch number")
class IndexedEpoch(OctantResource):
    @ns.marshal_with(indexed_epoch_model)
    @ns.response(200, "Current epoch successfully retrieved")
    def get(self):
        sg_epochs = sorted(graphql.epochs.get_epochs(), key=lambda d: d["epoch"])
        current_epoch = epochs.get_current_epoch()
        return {
            "currentEpoch": current_epoch,
            "indexedEpoch": sg_epochs[-1:][0]["epoch"],
        }
