from app.extensions import w3
from app.settings import config

abi = [
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "lastClaimedEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]


class Vault:
    def __init__(self):
        self.contract = w3.eth.contract(address=config.VAULT_CONTRACT_ADDRESS, abi=abi)

    def get_last_claimed_epoch(self, address: str) -> int:
        return self.contract.functions.lastClaimedEpoch(address).call()


vault = Vault()
