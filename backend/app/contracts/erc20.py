from flask import current_app as app

from app.contracts.smart_contract import SmartContract


class ERC20(SmartContract):
    def transfer(self, to_address, nonce):
        transaction = self.contract.functions.transfer(
            to_address, app.config["GLM_WITHDRAWAL_AMOUNT"]
        ).build_transaction({"from": app.config["GLM_SENDER_ADDRESS"], "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(
            transaction, app.config["GLM_SENDER_PRIVATE_KEY"]
        )
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
