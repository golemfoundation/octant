from app import database
from app.core.user.budget import get_patrons_budget
from app.database import finalized_epoch_snapshot
from app.database.models import PendingEpochSnapshot
from app.exceptions import RewardsException


def calculate_matched_rewards(
    snapshot: PendingEpochSnapshot, patrons_rewards: int
) -> int:
    return (
        int(snapshot.total_rewards)
        - int(snapshot.all_individual_rewards)
        + patrons_rewards
    )


def calculate_patrons_rewards(
    matched_rewards: int, total_rewards: int, all_individual_rewards: int
) -> int:
    return matched_rewards - total_rewards + all_individual_rewards


def get_estimated_matched_rewards() -> int:
    snapshot = database.pending_epoch_snapshot.get_last_snapshot()
    patrons_rewards = get_patrons_budget(snapshot)

    return calculate_matched_rewards(snapshot, patrons_rewards)


def calculate_matched_rewards_threshold(
    total_allocated: int, proposals_count: int
) -> int:
    if proposals_count <= 0:
        raise RewardsException(
            "Proposals are missing, cannot calculate the rewards threshold"
        )
    return int(total_allocated / (proposals_count * 2))
