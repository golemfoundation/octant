import json

from web3 import Web3

from config import settings
from web3_service import w3


class Contract:
    def __init__(self, contract_def_file, address):
        with open(contract_def_file, 'r') as contract_def:
            self.contract = w3.eth.contract(
                address=Web3.toChecksumAddress(address),
                abi=json.load(contract_def)["abi"])


class Epochs(Contract):
    def __init__(self):
        super().__init__(settings.EPOCHS_CONTRACT_DEF, settings.EPOCHS_CONTRACT_ADDRESS)

    def start(self):
        return self.contract.functions.start().call(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS}
        )

    def epoch_duration(self):
        return self.contract.functions.epochDuration().call(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS}
        )

    def get_current_epoch(self):
        return self.contract.functions.getCurrentEpoch().call(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS}
        )


class Oracle(Contract):
    def __init__(self, contract_def, address):
        super().__init__(contract_def, address)

    def get_balance(self, epoch):
        return self.contract.functions.balanceByEpoch(epoch).call(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS}
        )

    def build_set_balance_tx(self, epoch, balance, nonce):
        transaction = self.contract.functions.setBalance(epoch, balance).build_transaction(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS, "nonce": nonce})
        return w3.eth.account.sign_transaction(transaction, settings.ORACLE_MAINTAINER_PRIVATE_KEY)


class BeaconChainOracle(Oracle):
    def __init__(self, contract_def, address):
        super().__init__(contract_def, address)

    def get_validator_indexes(self):
        return self.contract.functions.validatorIndexes().call(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS}
        )


class ExecutionLayerOracle(Oracle):
    def __init__(self, contract_def, address):
        super().__init__(contract_def, address)

    def get_validator_address(self):
        return self.contract.functions.validatorAddress().call(
            {"from": settings.ORACLE_MAINTAINER_ADDRESS}
        )
