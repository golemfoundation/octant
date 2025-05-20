import logging

from eth_account import Account
from hexbytes import HexBytes

from v2.core.contracts import SmartContract
from web3.middleware.signing import async_construct_sign_and_send_raw_middleware


class VaultContracts(SmartContract):
    async def get_last_claimed_epoch(self, address: str) -> int:
        logging.debug(
            f"[Vault contract] Getting last claimed epoch for address: {address}"
        )

        return await self.contract.functions.lastClaimedEpoch(address).call()

    async def fund(self, account: Account, amount: int):
        logging.debug(
            f"[Vault contract] Funding account: {account.address} with amount: {amount}"
        )

        transaction = {
            "from": account.address,
            "to": self.contract.address,
            "value": amount,
        }
        self.w3.middleware_onion.add(
            await async_construct_sign_and_send_raw_middleware(account)
        )
        tx_hash = await self.w3.eth.send_transaction(transaction)
        await self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_hash

    async def get_merkle_root(self, epoch: int) -> str:
        logging.debug(f"[Vault contract] Getting merkle root for epoch: {epoch}")

        return await self.contract.functions.merkleRoots(epoch).call()

    async def is_merkle_root_set(self, epoch: int) -> bool:
        logging.debug(
            f"[Vault contract] Checking if merkle root is set for epoch: {epoch}"
        )

        unset = b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        merkle_root = await self.get_merkle_root(epoch)
        return merkle_root != unset

    async def set_merkle_root(
        self, account: Account, epoch_number: int, root: str
    ) -> HexBytes:
        logging.debug(f"[Vault contract] Setting merkle root for epoch: {epoch_number}")

        nonce = await self.w3.eth.get_transaction_count(
            account.address, block_identifier="latest"
        )

        transaction = await self.contract.functions.setMerkleRoot(
            epoch_number, root
        ).build_transaction({"from": account.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        tx_hash = await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        logging.debug(f"[Vault contract] Transaction sent with hash: {tx_hash.hex()}")
        return tx_hash

    async def batch_withdraw(
        self, account: Account, epoch_number: int, amount: int, merkle_proof: list[str]
    ):
        logging.debug(
            f"[Vault contract] Withdrawing rewards for account: {account.address}, epoch: {epoch_number} and amount: {amount} and merkle proof: {merkle_proof}"
        )

        nonce = await self.w3.eth.get_transaction_count(account.address)

        transaction = await self.contract.functions.batchWithdraw(
            [(epoch_number, amount, merkle_proof)]
        ).build_transaction({"from": account.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        tx_hash = await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

        logging.debug(f"[Vault contract] Transaction sent with hash: {tx_hash.hex()}")
        return tx_hash


VAULT_ABI = [
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
    {
        "inputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "epoch", "type": "uint256"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"},
                    {"internalType": "bytes32[]", "name": "proof", "type": "bytes32[]"},
                ],
                "internalType": "struct Vault.WithdrawPayload[]",
                "name": "payloads",
                "type": "tuple[]",
            }
        ],
        "name": "batchWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]
