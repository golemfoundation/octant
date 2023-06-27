from app.database import pending_epoch_snapshot, finalized_epoch_snapshot
from app import exceptions


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
