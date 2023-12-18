# TODO consider calling API to get this value: https://linear.app/golemfoundation/issue/OCT-901/cache-a-call-to-beaconchain-on-external-api-level
ESTIMATED_STAKED_AMOUNT = 100000_000000000_000000000

# TODO call an API to get a real value instead of hardcoding: https://linear.app/golemfoundation/issue/OCT-902/api-call-to-get-validators-api
ESTIMATED_STAKING_APR = 0.0345


def estimate_staking_proceeds(
    epoch_duration_sec: int,
    staked_amount=ESTIMATED_STAKED_AMOUNT,
    apr=ESTIMATED_STAKING_APR,
) -> int:
    if epoch_duration_sec <= 0:
        return 0
    return int(int(staked_amount * apr) / 31536000 * epoch_duration_sec)
