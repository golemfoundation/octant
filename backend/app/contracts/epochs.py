from app.extensions import w3
from app.settings import config

abi = [
    {
        "inputs": [],
        "name": "getCurrentEpoch",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isDecisionWindowOpen",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]


class Epochs:
    def __init__(self):
        self.contract = w3.eth.contract(address=config.EPOCHS_CONTRACT_ADDRESS, abi=abi)

    def is_decision_window_open(self) -> bool:
        return self.contract.functions.isDecisionWindowOpen().call()

    def get_current_epoch(self):
        return self.contract.functions.getCurrentEpoch().call()


epochs = Epochs()
