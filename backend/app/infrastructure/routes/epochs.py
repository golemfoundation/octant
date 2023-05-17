from flask import Response
from flask_restx import Resource, Namespace

from app.controllers import epochs
from app.extensions import api

ns = Namespace("epochs", description="Octant epochs")
api.add_namespace(ns)


@ns.route("/snapshot")
@ns.doc(
    description="Take a database snapshot of the recently completed epoch. \
    This endpoint should be executed at the beginning of an epoch to activate \
    a decision window."
)
@ns.response(
    200, "Snapshot could not be created due to an existing snapshot for previous epoch"
)
@ns.response(201, "Snapshot created successfully")
class EpochsSnapshot(Resource):
    def post(self):
        epoch = epochs.snapshot_previous_epoch()
        return ({"epoch": epoch}, 201) if epoch is not None else Response()
