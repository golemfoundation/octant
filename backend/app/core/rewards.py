from decimal import Decimal
from app import database
from app.database.models import EpochSnapshot


def calculate_total_rewards(eth_proceeds: int, locked_ratio: Decimal) -> int:
    return int(eth_proceeds * locked_ratio.sqrt())


def calculate_all_individual_rewards(eth_proceeds: int, locked_ratio: Decimal) -> int:
    return int(eth_proceeds * locked_ratio)


def calculate_matched_rewards(snapshot: EpochSnapshot) -> int:
    return int(snapshot.total_rewards) - int(snapshot.all_individual_rewards)


def get_matched_rewards_from_epoch(epoch: int) -> int:
    snapshot = database.epoch_snapshot.get_by_epoch_num(epoch)

    return calculate_matched_rewards(snapshot)
