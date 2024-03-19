from flask import current_app as app

from app import exceptions
from app.infrastructure import database
from app.pydantic import Model


class SnapshotsState(Model):
    last_pending_snapshot_num: int
    last_finalized_snapshot_num: int


def get_snapshots_state() -> SnapshotsState:
    return SnapshotsState(
        last_pending_snapshot_num=_get_last_pending_snapshot(),
        last_finalized_snapshot_num=_get_last_finalized_snapshot(),
    )


def _get_last_pending_snapshot() -> int:
    try:
        last_snapshot = database.pending_epoch_snapshot.get_last_snapshot()
        return last_snapshot.epoch
    except exceptions.MissingSnapshot:
        app.logger.warning("No pending snapshot found")
        return 0


def _get_last_finalized_snapshot() -> int:
    try:
        last_snapshot = database.finalized_epoch_snapshot.get_last_snapshot()
        return last_snapshot.epoch
    except exceptions.MissingSnapshot:
        app.logger.warning("No finalized snapshot found")
        return 0
