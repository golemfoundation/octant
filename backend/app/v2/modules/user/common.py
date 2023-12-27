from typing import Tuple, List

from app.v2.context.epoch_details import EpochDetails
from app.v2.engine.epochs_settings import EpochSettings
from app.v2.engine.user.effective_deposit import (
    UserDeposit,
    UserEffectiveDepositPayload,
)


def calculate_effective_deposits(
    epoch_details: EpochDetails, epoch_settings: EpochSettings, events
) -> Tuple[List[UserDeposit], int]:
    start = epoch_details.start_sec
    end = epoch_details.end_sec
    effective_deposit_calculator = epoch_settings.user.effective_deposit

    return effective_deposit_calculator.calculate_users_effective_deposits(
        UserEffectiveDepositPayload(
            epoch_start=start, epoch_end=end, lock_events_by_addr=events
        )
    )
