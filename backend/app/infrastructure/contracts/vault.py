from flask import current_app as app
from hexbytes import HexBytes
from web3.middleware import construct_sign_and_send_raw_middleware
from app.infrastructure.contracts.smart_contract import SmartContract


class Vault(SmartContract):
    def get_last_claimed_epoch(self, address: str) -> int:
        app.logger.debug(
            f"[Vault contract] Getting last claimed epoch for address: {address}"
        )
        return self.contract.functions.lastClaimedEpoch(address).call()

    def fund(self, account, amount: int):
        transaction = {
            "from": account.address,
            "to": self.contract.address,
            "value": amount,
        }
        self.w3.middleware_onion.add(construct_sign_and_send_raw_middleware(account))
        tx_hash = self.w3.eth.send_transaction(transaction)
        self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_hash

    def get_merkle_root(self, epoch: int) -> str:
        app.logger.debug(f"[Vault contract] Getting merkle root for epoch: {epoch}")
        return self.contract.functions.merkleRoots(epoch).call()

    def is_merkle_root_set(self, epoch: int) -> bool:
        unset = b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        return self.get_merkle_root(epoch) != unset

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

    def batch_withdraw(self, account, epoch: int, amount: int, merkle_proof: list[str]):
        app.logger.debug(
            f"[Vault contract] Withdrawing rewards for account: {account.address}, epoch: {epoch} and amount: {amount} and merkle proof: {merkle_proof}"
        )

        nonce = self.w3.eth.get_transaction_count(account.address)

        transaction = self.contract.functions.batchWithdraw(
            [(epoch, amount, merkle_proof)]
        ).build_transaction({"from": account.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
