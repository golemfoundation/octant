from app.extensions import db
from app.infrastructure import database
from tests.helpers.constants import (
    NO_PATRONS_REWARDS,
    TOTAL_WITHDRAWALS,
)


def create_finalized_snapshot(epoch_nr: int, matched_rewards: int, leftover: int):
    database.finalized_epoch_snapshot.save_snapshot(
        epoch_nr,
        matched_rewards,
        NO_PATRONS_REWARDS,
        leftover,
        total_withdrawals=TOTAL_WITHDRAWALS,
    )

    db.session.commit()
