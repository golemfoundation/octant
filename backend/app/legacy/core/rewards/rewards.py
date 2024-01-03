from app.exceptions import RewardsException
from app.infrastructure.database.models import PendingEpochSnapshot


def calculate_matched_rewards(
    snapshot: PendingEpochSnapshot, patrons_rewards: int
) -> int:
    return (
        int(snapshot.total_rewards)
        - int(snapshot.all_individual_rewards)
        + patrons_rewards
    )


def calculate_matched_rewards_threshold(
    total_allocated: int, proposals_count: int
) -> int:
    if proposals_count <= 0:
        raise RewardsException(
            "Proposals are missing, cannot calculate the rewards threshold"
        )
    return int(total_allocated / (proposals_count * 2))
