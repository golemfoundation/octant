from app.extensions import w3
from app.settings import config
from web3 import exceptions

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
        return self.contract.functions.isDecisionWindowOpen().call()

    def get_current_epoch(self):
        try:
            return self.contract.functions.getCurrentEpoch().call()
        except exceptions.ContractLogicError:
            # HN:Epochs/not-started-yet
            return 0

    def get_pending_epoch(self):
        try:
            return self.contract.functions.getPendingEpoch().call()
        except exceptions.ContractLogicError:
            # HN:Epochs/not-pending
            return 0

    def get_finalized_epoch(self):
        try:
            return self.contract.functions.getFinalizedEpoch().call()
        except exceptions.ContractLogicError:
            # HN:Epochs/not-finalized
            return 0


epochs = Epochs()
