import requests

from config import settings
from contracts import w3, ExecutionLayerOracle

execution_layer_contract = ExecutionLayerOracle(settings.EXECUTION_LAYER_ORACLE_CONTRACT_DEF,
                                                settings.EXECUTION_LAYER_ORACLE_CONTRACT_ADDRESS)

headers = {
    "accept": "application/json",
    "content-type": "application/json"
}


def should_update_oracle(epoch):
    return epoch > 0 and execution_layer_contract.get_balance(epoch) == 0


def update_oracle(epoch, block_number, nonce):
    balance = _get_balance(block_number)
    signed_tx = execution_layer_contract.build_set_balance_tx(epoch, balance, nonce)
    return w3.eth.send_raw_transaction(signed_tx.rawTransaction)


def _get_balance(block_number):
    if settings.ENVIRONMENT == "DEV":
        return 200 * 10 ** 18
    else:
        return _get_validator_balance(block_number)


def _get_validator_balance(block_number):
    url = settings.ALCHEMY_API_URL
    validator_address = execution_layer_contract.get_validator_address()
    payload = {
        "id": 1,
        "jsonrpc": "2.0",
        "params": [validator_address, hex(block_number)],
        "method": "eth_getBalance"
    }
    response = requests.post(url, json=payload, headers=headers).json()
    return int(response["result"], 16)
