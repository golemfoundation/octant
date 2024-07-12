import pytest

from app.modules.common.time import days_to_sec
from app.modules.staking.proceeds.core import (
    estimate_staking_proceeds,
    sum_withdrawals,
    sum_mev,
)


@pytest.mark.parametrize(
    "days, result",
    [
        (72, 749_589_041_095_890_305_024),
        (90, 936_986_301_369_862_848_512),
    ],
)
def test_estimate_epoch_eth_staking_proceeds(days, result):
    seconds = days_to_sec(days)
    assert estimate_staking_proceeds(seconds) == result


def test_sum_mev():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
        {
            "hash": "0xb82d5b107f7cabb56e3da80ed0e3977d930942dac0106ba2f280f7676b85d758",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "52289789573601810",
            "isError": "0",
            "functionName": "",
        },
    ]
    internal_txs = [
        {
            "hash": "0x6281a4a2007cdcce0485b0e7866e69eddcacdf2b6266601046bfc99c2fc288b8",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "3081369209350255",
            "isError": "0",
        },
        {
            "hash": "0x5f0697398c5fabdf4a8ba1ce7acb657d47368b6bc2610b59339745c2c9d97f0b",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "289676626681230680",
            "isError": "0",
        },
    ]
    result = sum_mev(
        "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, internal_txs
    )

    assert result == 408779583_065964270


def test_sum_mev_filter_duplicates():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
    ]
    result = sum_mev("0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, [])

    assert result == 63731797_601781525


def test_sum_mev_filter_duplicates_between_normal_and_internal():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
    ]
    internal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "3081369209350255",
            "isError": "0",
        },
    ]
    result = sum_mev(
        "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, internal_txs
    )

    assert result == 63731797_601781525


def test_sum_mev_filter_errors():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
        {
            "hash": "0xb82d5b107f7cabb56e3da80ed0e3977d930942dac0106ba2f280f7676b85d758",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "52289789573601810",
            "isError": "1",
            "functionName": "",
        },
    ]
    result = sum_mev("0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, [])

    assert result == 63731797_601781525


def test_sum_mev_filter_tx_from_withdrawals_target():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
        {
            "hash": "0xb82d5b107f7cabb56e3da80ed0e3977d930942dac0106ba2f280f7676b85d758",
            "from": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "to": "0x4f80ce44afab1e5e940574f135802e12ad2a5ef0",
            "value": "52289789573601810",
            "isError": "0",
            "functionName": "",
        },
    ]
    result = sum_mev("0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, [])

    assert result == 63731797_601781525


def test_sum_mev_filter_function_calls():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "63731797601781525",
            "isError": "0",
            "functionName": "",
        },
        {
            "hash": "0xb82d5b107f7cabb56e3da80ed0e3977d930942dac0106ba2f280f7676b85d758",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "52289789573601810",
            "isError": "0",
            "functionName": "execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)",
        },
    ]
    result = sum_mev("0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, [])

    assert result == 63731797_601781525


def test_sum_mov_overflow_int64():
    normal_txs = [
        {
            "hash": "0x48da2e43af550ff80da0d31340e48a3e32d4e2612ae851b653cc17f859e235dd",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "10000000000000000000123",
            "isError": "0",
            "functionName": "",
        },
        {
            "hash": "0xb82d5b107f7cabb56e3da80ed0e3977d930942dac0106ba2f280f7676b85d758",
            "to": "0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1",
            "value": "20000000000000000000345",
            "isError": "0",
            "functionName": "",
        },
    ]
    result = sum_mev("0xba1951df0c0a52af23857c5ab48b4c43a57e7ed1", normal_txs, [])

    assert result == 30000000000000000000468


def test_sum_withdrawals():
    withdrawals_txs = [
        {"amount": "1498810", "withdrawalIndex": "11446030"},
        {"amount": "1490162", "withdrawalIndex": "11446032"},
    ]
    result = sum_withdrawals(withdrawals_txs)

    assert result == 2988972_000000000


def test_sum_withdrawals_filter_duplicates():
    withdrawals_txs = [
        {"amount": "1498810", "withdrawalIndex": "11446030"},
        {"amount": "1490162", "withdrawalIndex": "11446032"},
        {"amount": "1490162", "withdrawalIndex": "11446032"},
    ]
    result = sum_withdrawals(withdrawals_txs)

    assert result == 2988972_000000000


def test_sum_withdrawals_overflow_int64():
    withdrawals_txs = [
        {"amount": "1000000000", "withdrawalIndex": i} for i in range(1000)
    ]
    result = sum_withdrawals(withdrawals_txs)

    assert result == 1000_000000000_000000000


def test_sum_withdrawals_filter_deposit_withdrawals():
    withdrawals_txs = [
        {"amount": "32000000123", "withdrawalIndex": "1"},
        {"amount": "20000", "withdrawalIndex": "2"},
    ]
    result = sum_withdrawals(withdrawals_txs)

    assert result == 20123_000000000
