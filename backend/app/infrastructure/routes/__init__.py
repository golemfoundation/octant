from flask import send_from_directory

from app import settings
from app.infrastructure import OctantResource
from app.extensions import api
from . import (  # noqa
    info,
    history,
    snapshots,
    rewards,
    deposits,
    withdrawals,
    allocations,
    glm_claim,
    epochs,
    user,
    validators_stats,
    multisig_signatures,
    projects,
    delegation,
)


@api.route("/favicon.ico")
class Favicon(OctantResource):
    def get(self):
        static_folder = f"{settings.config.PROJECT_ROOT}/static"
        return send_from_directory(
            static_folder, "favicon.ico", mimetype="image/vnd.microsoft.icon"
        )
