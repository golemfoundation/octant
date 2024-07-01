from app.extensions import db
from app.infrastructure import database
from tests.helpers.constants import (
    MOCKED_PENDING_EPOCH_NO,
    ETH_PROCEEDS,
    TOTAL_ED,
    LOCKED_RATIO,
    TOTAL_REWARDS,
    VANILLA_INDIVIDUAL_REWARDS,
    OPERATIONAL_COST,
    USER1_ED,
    USER2_ED,
    USER3_ED,
    USER1_BUDGET,
    USER2_BUDGET,
    USER3_BUDGET,
)


def create_pending_snapshot(
    mock_users_db, epoch_nr: int, optional_cf=None, optional_ppf=None
):
    database.pending_epoch_snapshot.save_snapshot(
        epoch_nr,
        ETH_PROCEEDS,
        TOTAL_ED,
        LOCKED_RATIO,
        TOTAL_REWARDS,
        VANILLA_INDIVIDUAL_REWARDS,
        OPERATIONAL_COST,
        community_fund=optional_cf,
        ppf=optional_ppf,
    )
    user1, user2, user3 = mock_users_db
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user1, USER1_ED, USER1_ED)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user2, USER2_ED, USER2_ED)
    database.deposits.add(MOCKED_PENDING_EPOCH_NO, user3, USER3_ED, USER3_ED)
    database.budgets.add(MOCKED_PENDING_EPOCH_NO, user1, USER1_BUDGET)
    database.budgets.add(MOCKED_PENDING_EPOCH_NO, user2, USER2_BUDGET)
    database.budgets.add(MOCKED_PENDING_EPOCH_NO, user3, USER3_BUDGET)

    db.session.commit()
