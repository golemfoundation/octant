from typing import Protocol

from v2.core.contracts import SmartContract


class AddressKey(Protocol):
    address: str
    key: str


class GLMContracts(SmartContract):
    async def transfer(
        self, sender: AddressKey, receiver_address: str, amount: int
    ) -> None:
        nonce = await self.w3.eth.get_transaction_count(sender.address)
        transaction = await self.contract.functions.transfer(
            receiver_address, amount
        ).build_transaction({"from": sender.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, sender.key)
        await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    async def approve(self, owner: AddressKey, benefactor_address, wad: int):
        print("owner of lock: ", owner)
        print("owner address: ", owner.address)
        print("owner key: ", owner.key)
        print("benefactor of lock: ", benefactor_address)
        nonce = await self.w3.eth.get_transaction_count(owner.address)
        transaction = await self.contract.functions.approve(
            benefactor_address, wad
        ).build_transaction({"from": owner.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, owner.key)
        return await self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    async def balance_of(self, owner: str) -> int:
        return await self.contract.functions.balanceOf(owner).call()


ERC20_ABI = [
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
    {
        "inputs": [
            {"internalType": "address", "name": "usr", "type": "address"},
            {"internalType": "uint256", "name": "wad", "type": "uint256"},
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]
