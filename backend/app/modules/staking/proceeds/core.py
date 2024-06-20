import pandas as pd
from gmpy2 import mpz

from app.constants import VALIDATOR_DEPOSIT_GWEI
from app.extensions import w3

# TODO consider calling API to get this value: https://linear.app/golemfoundation/issue/OCT-901/cache-a-call-to-beaconchain-on-external-api-level
ESTIMATED_STAKED_AMOUNT = 100000_000000000_000000000

# TODO call an API to get a real value instead of hardcoding: https://linear.app/golemfoundation/issue/OCT-902/api-call-to-get-validators-api
ESTIMATED_STAKING_APR = 0.038


def estimate_staking_proceeds(
    epoch_duration_sec: int,
    staked_amount=ESTIMATED_STAKED_AMOUNT,
    apr=ESTIMATED_STAKING_APR,
) -> int:
    if epoch_duration_sec <= 0:
        return 0
    return int(int(staked_amount * apr) / 31536000 * epoch_duration_sec)


def sum_mev(
    withdrawals_target: str, normal_txs: list[dict], internal_txs: list[dict]
) -> int:
    df = pd.concat(
        [
            pd.DataFrame(normal_txs),
            pd.DataFrame(internal_txs),
        ],
        join="outer",
    )

    # filter out errors, duplicated and txs not sent to withdrawals target
    df = df[df["isError"] != "1"]
    df = df[~df["hash"].duplicated()]
    df = df[df["to"] == withdrawals_target]

    # Filter out functions other than transfer funds to the address (execTransaction, etc.)
    # This is only relevant to smart contract accounts
    df = df[(df["functionName"].isna()) | (df["functionName"] == "")]

    total = df["value"].apply(lambda x: mpz(x)).sum()

    return int(total)


def sum_withdrawals(withdrawals_txs: list[dict]) -> int:
    df = pd.DataFrame(withdrawals_txs)
    df = df[~df["withdrawalIndex"].duplicated()]
    total_gwei = df["amount"].apply(mpz).apply(_filter_deposit_withdrawals).sum()

    return w3.to_wei(int(total_gwei), "gwei")


def aggregate_proceeds(mev: int, withdrawals: int, blocks_rewards_eth: float) -> int:
    return mev + withdrawals + int(w3.to_wei(blocks_rewards_eth, "ether"))


def _filter_deposit_withdrawals(amount: mpz) -> mpz:
    if amount >= VALIDATOR_DEPOSIT_GWEI:
        return amount - VALIDATOR_DEPOSIT_GWEI
    return amount
