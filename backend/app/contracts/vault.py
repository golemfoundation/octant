from flask import current_app as app
from hexbytes import HexBytes

from app.crypto.account import Account
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
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "merkleRoots",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "epoch", "type": "uint256"},
            {"internalType": "bytes32", "name": "root", "type": "bytes32"},
        ],
        "name": "setMerkleRoot",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


class Vault:
    def __init__(self):
        self.contract = w3.eth.contract(address=config.VAULT_CONTRACT_ADDRESS, abi=abi)

    def get_last_claimed_epoch(self, address: str) -> int:
        app.logger.debug(
            f"[Vault contract] Getting last claimed epoch for address: {address}"
        )
        return self.contract.functions.lastClaimedEpoch(address).call()

    def get_merkle_root(self, epoch: int) -> str:
        app.logger.debug(f"[Vault contract] Getting merkle root for epoch: {epoch}")
        return self.contract.functions.merkleRoots(epoch).call()

    def set_merkle_root(self, epoch: int, root: str, nonce: int = None) -> HexBytes:
        app.logger.debug(f"[Vault contract] Setting merkle root for epoch: {epoch}")
        account = Account.from_key(config.TESTNET_MULTISIG_PRIVATE_KEY)
        nonce = nonce if nonce is not None else account.nonce
        transaction = self.contract.functions.setMerkleRoot(
            epoch, root
        ).build_transaction({"from": account.address, "nonce": nonce})
        signed_tx = w3.eth.account.sign_transaction(transaction, account.key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        app.logger.debug(
            f"[Vault contract] Transaction sent with hash: {tx_hash.hex()}"
        )
        return tx_hash


vault = Vault()
