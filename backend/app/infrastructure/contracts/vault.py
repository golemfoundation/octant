from flask import current_app as app
from hexbytes import HexBytes

from app.infrastructure.contracts.smart_contract import SmartContract


class Vault(SmartContract):
    def get_last_claimed_epoch(self, address: str) -> int:
        app.logger.debug(
            f"[Vault contract] Getting last claimed epoch for address: {address}"
        )
        return self.contract.functions.lastClaimedEpoch(address).call()

    def get_merkle_root(self, epoch: int) -> str:
        app.logger.debug(f"[Vault contract] Getting merkle root for epoch: {epoch}")
        return self.contract.functions.merkleRoots(epoch).call()

    def set_merkle_root(self, account, epoch: int, root: str) -> HexBytes:
        app.logger.debug(f"[Vault contract] Setting merkle root for epoch: {epoch}")
        transaction = self.contract.functions.setMerkleRoot(
            epoch, root
        ).build_transaction({"from": account.address, "nonce": account.nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        app.logger.debug(
            f"[Vault contract] Transaction sent with hash: {tx_hash.hex()}"
        )
        return tx_hash

    def batch_withdraw(self, epoch: int, amount: int, merkle_proof: dict):
        print("Number of arguments received:", len([self, epoch, amount, merkle_proof]))
        app.logger.debug(f"[Vault contract] Withdrawing rewards for epoch: {epoch} and amount: {amount} and merkle proof: {merkle_proof}")
        return self.contract.functions.batchWithdraw([[epoch, amount, merkle_proof]]).call()
