


from v2.core.contracts import SmartContract


from typing import Protocol

class AddressKey(Protocol):
    address: str
    key: str


class DepositsContracts(SmartContract):

    def lock(self, account: AddressKey, amount: int):
        nonce = self.w3.eth.get_transaction_count(account.address)
        transaction = self.contract.functions.lock(amount).build_transaction(
            {"from": account.address, "nonce": nonce}
        )
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    def balance_of(self, owner_address: str) -> int:
        return self.contract.functions.deposits(owner_address).call()


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
