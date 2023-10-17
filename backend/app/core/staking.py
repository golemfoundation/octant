from app.constants import ESTIMATED_STAKED_AMOUNT, ESTIMATED_STAKING_APR


def estimate_epoch_eth_staking_proceeds(epoch_duration_sec: int) -> int:
    if epoch_duration_sec <= 0:
        return 0
    return int(
        int(ESTIMATED_STAKED_AMOUNT * ESTIMATED_STAKING_APR)
        / 31536000
        * epoch_duration_sec
    )
