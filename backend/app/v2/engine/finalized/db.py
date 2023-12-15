from typing import Optional

from app.database.models import FinalizedEpochSnapshot


def get_by_epoch_num(epoch) -> Optional[FinalizedEpochSnapshot]:
    return FinalizedEpochSnapshot.query.filter_by(epoch=epoch).first()
