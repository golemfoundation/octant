from datetime import datetime

from flask import current_app as app

from app.extensions import epochs


def get_current_epoch() -> int:
    now = datetime.utcnow()
    epoch_0_end = datetime.utcfromtimestamp(app.config["EPOCH_0_END"])
    epoch_1_end = datetime.utcfromtimestamp(app.config["EPOCH_1_END"])
    app.logger.debug(
        f"now: {now}, epoch 0 end: {epoch_0_end}, epoch 1 end: {epoch_1_end}"
    )

    if now < epoch_0_end:
        return 0
    elif now < epoch_1_end:
        return 1
    else:
        return epochs.get_current_epoch()
