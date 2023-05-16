from flask import render_template, make_response, send_from_directory, Response
from flask_restx import Resource, Namespace

from app import settings
from app.extensions import api
from app.controllers import epochs

ns = Namespace("epochs", description="Octant epochs")
api.add_namespace(ns)


@ns.route("/snapshot")
@ns.doc(
    description="Take a database snapshot of the recently completed epoch. \
    This endpoint should be executed at the beginning of an epoch to activate \
    a decision window."
)
class EpochsSnapshot(Resource):
    def post(self):
        epoch = epochs.snapshot_previous_epoch()
        status = 201 if epoch > 0 else 409

        return Response(status=status)
