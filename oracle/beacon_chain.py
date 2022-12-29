import requests
from eth_utils import to_wei

from config import settings
from contracts import BeaconChainOracle, w3

beacon_contract = BeaconChainOracle(settings.BEACONCHAIN_ORACLE_CONTRACT_DEF,
                                    settings.BEACONCHAIN_ORACLE_CONTRACT_ADDRESS)


def should_update_oracle(epoch):
    return epoch > 0 and beacon_contract.get_balance(epoch) == 0


def update_oracle(epoch, block_number, nonce):
    beacon_epoch_number = _get_beacon_epoch_by_block_number(block_number)
    balance = _get_balance(beacon_epoch_number)
    signed_tx = beacon_contract.build_set_balance_tx(epoch, to_wei(balance, "gwei"), nonce)
    return w3.eth.send_raw_transaction(signed_tx.rawTransaction)


def _get_beacon_epoch_by_block_number(block_number):
    url = f"{settings.BEACONCHAIN_API_URL}/execution/block/{block_number}"
    block = requests.get(url).json()["data"][0]
    return block["posConsensus"]["epoch"]


def _get_balance(epoch):
    if settings.ENVIRONMENT == "DEV":
        return 200 * 10 ** 18
    else:
        return _get_validators_balances(epoch)


def _get_validators_balances(epoch):
    validator_indexes_str = beacon_contract.get_validator_indexes()
    validator_indexes_list = [int(index) for index in validator_indexes_str.split(",")]
    url = f"{settings.BEACONCHAIN_API_URL}/validator/{validator_indexes_str}/balancehistory"
    balance_history = requests.get(url).json()["data"]
    return sum([data["balance"] for data in balance_history if
                data["epoch"] == epoch and data[
                    "validatorindex"] in validator_indexes_list])
