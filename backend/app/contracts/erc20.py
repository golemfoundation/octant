from eth_utils import to_checksum_address

from app.extensions import w3
from app.settings import config

abi = [
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]


class ERC20:
    def __init__(self, address):
        self.contract = w3.eth.contract(address=address, abi=abi)

    def total_supply(self):
        return self.contract.functions.totalSupply().call()

    def balance_of(self, address):
        checksum_address = to_checksum_address(address)
        return self.contract.functions.balanceOf(checksum_address).call()


glm = ERC20(config.GLM_CONTRACT_ADDRESS)
gnt = ERC20(config.GNT_CONTRACT_ADDRESS)
