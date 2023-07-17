from datetime import datetime

from app.contracts import epochs
from app.settings import config


def get_current_epoch() -> int:
    now = datetime.utcnow()
    epoch_0_end = datetime.fromtimestamp(config.EPOCH_0_END)
    epoch_1_end = datetime.fromtimestamp(config.EPOCH_1_END)

    if now < epoch_0_end:
        return 0
    elif now < epoch_1_end:
        return 1
    else:
        return epochs.get_current_epoch()
