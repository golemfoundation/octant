from app.database import epoch_snapshot
from app import exceptions


def is_epoch_snapshotted(epoch: int) -> bool:
    try:
        epoch_snapshot.get_by_epoch_num(epoch)
        return True
    except exceptions.InvalidEpoch:
        return False
