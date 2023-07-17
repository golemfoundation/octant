from flask import send_from_directory
from flask_restx import Resource

from app import settings
from app.extensions import api
from . import (
    docs,
    history,
    snapshots,
    rewards,
    deposits,
    withdrawals,
    allocations,
    epochs,
)


@api.route("/favicon.ico")
class Favicon(Resource):
    def get(self):
        static_folder = f"{settings.config.PROJECT_ROOT}/static"
        return send_from_directory(
            static_folder, "favicon.ico", mimetype="image/vnd.microsoft.icon"
        )
