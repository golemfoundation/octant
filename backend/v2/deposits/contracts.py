from typing import Protocol

from v2.core.contracts import SmartContract


class AddressKey(Protocol):
    address: str
    key: str


class DepositsContracts(SmartContract):
    async def lock(self, account: AddressKey, amount: int):
        nonce = await self.w3.eth.get_transaction_count(account.address)
        transaction = await self.contract.functions.lock(amount).build_transaction(
            {"from": account.address, "nonce": nonce}
        )
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        return await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    async def balance_of(self, owner_address: str) -> int:
        return await self.contract.functions.deposits(owner_address).call()


DEPOSITS_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "lock",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "deposits",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]
