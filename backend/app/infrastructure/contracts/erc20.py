from flask import current_app as app

from app.infrastructure.contracts.smart_contract import SmartContract


class ERC20(SmartContract):
    def glm_fund(self, to_address, nonce):
        transaction = self.contract.functions.transfer(
            to_address, app.config["GLM_WITHDRAWAL_AMOUNT"]
        ).build_transaction({"from": app.config["GLM_SENDER_ADDRESS"], "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(
            transaction, app.config["GLM_SENDER_PRIVATE_KEY"]
        )
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    def transfer(self, sender, receiver: str, amount: int):
        nonce = self.w3.eth.get_transaction_count(sender.address)
        transaction = self.contract.functions.transfer(
            receiver, amount
        ).build_transaction({"from": sender.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, sender.key)
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    def approve(self, owner, benefactor, wad: int):
        print("owner of lock: ", owner)
        print("owner address: ", owner.address)
        print("owner key: ", owner.key)
        print("benefactor of lock: ", benefactor)
        nonce = self.w3.eth.get_transaction_count(owner.address)
        transaction = self.contract.functions.approve(
            benefactor, wad
        ).build_transaction({"from": owner.address, "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(transaction, owner.key)
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    def balance_of(self, owner: str) -> int:
        return self.contract.functions.balanceOf(owner).call()
