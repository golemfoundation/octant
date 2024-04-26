from flask import current_app as app
from hexbytes import HexBytes
from eth_abi import encode
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

    def is_merkle_root_set(self, epoch: int) -> bool:
        unset = b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
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

    def batch_withdraw(self, epoch: int, amount: int, merkle_proof: list[str]):
        print("Number of arguments received:", len([self, epoch, amount, merkle_proof]))
        app.logger.debug(f"[Vault contract] Withdrawing rewards for epoch: {epoch} and amount: {amount} and merkle proof: {merkle_proof}")

        # NOTE! encoding is done automatically by web3py, there is no need to do it manually
        # args = encode(['[[(uint256,uint256,bytes32[])]]'], [[(epoch,amount,merkle_proof)]])
        # merkle_proof = [bytes.fromhex(x[2:]) for x in merkle_proof]
        # args = encode(['(uint,uint,bytes32[])[]'], [[(epoch, amount, merkle_proof)]])
        # return self.contract.functions.batchWithdraw(args).transact()

        # this prevents automatic encoder from recognizing arguments as correct
        # merkle_proof = [x[2:] for x in merkle_proof]

        # this fails with "wrong merkle proof" <- at least we pass encoding step
        return self.contract.functions.batchWithdraw([(epoch, amount, merkle_proof)]).transact()
