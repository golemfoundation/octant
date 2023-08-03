from flask import current_app as app
from web3 import exceptions

from app.extensions import w3
from app.settings import config

abi = [
    {
        "inputs": [],
        "name": "getCurrentEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getPendingEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getFinalizedEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "isDecisionWindowOpen",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
]


class Epochs:
    def __init__(self):
        self.contract = w3.eth.contract(address=config.EPOCHS_CONTRACT_ADDRESS, abi=abi)

    def is_decision_window_open(self) -> bool:
        app.logger.debug("[Epochs contract] Checking if decision window is open")
        return self.contract.functions.isDecisionWindowOpen().call()

    def get_current_epoch(self):
        try:
            app.logger.debug("[Epochs contract] Getting current epoch")
            return self.contract.functions.getCurrentEpoch().call()
        except exceptions.ContractLogicError:
            app.logger.warning("[Epochs contract] Current epoch not started yet")
            # HN:Epochs/not-started-yet
            return 0

    def get_pending_epoch(self):
        try:
            app.logger.debug("[Epochs contract] Getting pending epoch")
            return self.contract.functions.getPendingEpoch().call()
        except exceptions.ContractLogicError:
            app.logger.warning("[Epochs contract] No pending epoch")
            # HN:Epochs/not-pending
            return 0

    def get_finalized_epoch(self):
        try:
            app.logger.debug("[Epochs contract] Getting finalized epoch")
            return self.contract.functions.getFinalizedEpoch().call()
        except exceptions.ContractLogicError:
            app.logger.warning("[Epochs contract] No finalized epoch")
            # HN:Epochs/not-finalized
            return 0


epochs = Epochs()
