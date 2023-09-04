from eth_account import Account as EthAccount
from eth_account.signers.local import LocalAccount
from flask import current_app as app
from hexbytes import HexBytes

from app.extensions import w3


class Account(LocalAccount):
    @staticmethod
    def from_key(private_key: str):
        account = EthAccount.from_key(private_key)
        account.__class__ = Account
        return account

    @property
    def nonce(self) -> int:
        return w3.eth.get_transaction_count(self.address, block_identifier="latest")

    def send_eth(self, to: str, value: int, nonce: int = None) -> HexBytes:
        nonce = nonce if nonce is not None else self.nonce
        transaction = {
            "chainId": app.config["CHAIN_ID"],
            "from": self.address,
            "to": to,
            "value": value,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce,
        }
        # Estimate the gas required for the transaction
        transaction["gas"] = w3.eth.estimate_gas(transaction)

        signed_tx = self.sign_transaction(transaction)
        return w3.eth.send_raw_transaction(signed_tx.rawTransaction)
