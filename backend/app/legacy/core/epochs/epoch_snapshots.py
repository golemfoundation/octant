from enum import StrEnum

from app.infrastructure.database import finalized_epoch_snapshot, pending_epoch_snapshot
from app import exceptions


class PendingSnapshotStatus(StrEnum):
    NA = "not_applicable"
    ERROR = "error"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class FinalizedSnapshotStatus(StrEnum):
    NA = "not_applicable"
    ERROR = "error"
    TOO_EARLY = "too_early"
    IN_PROGRESS = "in_progress"
    DONE = "done"


def has_pending_epoch_snapshot(epoch: int) -> bool:
    try:
        pending_epoch_snapshot.get_by_epoch_num(epoch)
        return True
    except exceptions.InvalidEpoch:
        return False


def has_finalized_epoch_snapshot(epoch: int) -> bool:
    try:
        finalized_epoch_snapshot.get_by_epoch_num(epoch)
        return True
    except exceptions.InvalidEpoch:
        return False


def get_last_pending_snapshot() -> int:
    try:
        last_snapshot = pending_epoch_snapshot.get_last_snapshot()
        return last_snapshot.epoch
    except exceptions.MissingSnapshot:
        return 0


def get_last_finalized_snapshot() -> int:
    try:
        last_snapshot = finalized_epoch_snapshot.get_last_snapshot()
        return last_snapshot.epoch
    except exceptions.MissingSnapshot:
        return 0


def pending_snapshot_status(
    current_epoch, last_snapshot_epoch
) -> PendingSnapshotStatus:
    if current_epoch == 1:
        return PendingSnapshotStatus.NA
    if current_epoch - 2 == last_snapshot_epoch:
        return PendingSnapshotStatus.IN_PROGRESS
    if current_epoch - 1 == last_snapshot_epoch:
        return PendingSnapshotStatus.DONE
    raise exceptions.MissingSnapshot()


def finalized_snapshot_status(
    current_epoch: int, last_snapshot_epoch: int, is_open: bool
) -> FinalizedSnapshotStatus:
    if current_epoch == 1:
        return FinalizedSnapshotStatus.NA
    if current_epoch - 2 == last_snapshot_epoch:
        if is_open:
            return FinalizedSnapshotStatus.TOO_EARLY
        else:
            return FinalizedSnapshotStatus.IN_PROGRESS
    if current_epoch - 1 == last_snapshot_epoch:
        if is_open:
            raise exceptions.SnapshotTooEarly()
        else:
            return FinalizedSnapshotStatus.DONE
    raise exceptions.MissingSnapshot()
