from eth_utils import to_checksum_address
from flask import current_app as app

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
    {
        "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
        ],
        "name": "transfer",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


class ERC20:
    def __init__(self, address):
        self.contract = w3.eth.contract(address=address, abi=abi)

    def total_supply(self):
        app.logger.info("[GLM/GNT Contract] Getting total supply")
        return self.contract.functions.totalSupply().call()

    def balance_of(self, address):
        checksum_address = to_checksum_address(address)
        app.logger.info(
            f"[GLM/GNT Contract] Getting balance of address: {checksum_address}"
        )
        return self.contract.functions.balanceOf(checksum_address).call()

    def transfer(self, to_address, nonce):
        transaction = self.contract.functions.transfer(
            to_address, config.GLM_WITHDRAWAL_AMOUNT
        ).build_transaction({"from": config.GLM_SENDER_ADDRESS, "nonce": nonce})
        signed_tx = w3.eth.account.sign_transaction(
            transaction, config.GLM_SENDER_PRIVATE_KEY
        )
        return w3.eth.send_raw_transaction(signed_tx.rawTransaction)


glm = ERC20(config.GLM_CONTRACT_ADDRESS)
gnt = ERC20(config.GNT_CONTRACT_ADDRESS)
