from typing import Dict

from flask import current_app as app
from web3 import exceptions

from app.contracts.smart_contract import SmartContract


class Deposits(SmartContract):
    def lock(self, account, amount: int):
        nonce = self.w3.eth.get_transaction_count(account.address)
        transaction = self.contract.functions.lock(amount).build_transaction(
            {"from": account.address, "nonce": nonce}
        )
        signed_tx = self.w3.eth.account.sign_transaction(transaction, account.key)
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
