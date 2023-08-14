from eth_utils import to_checksum_address
from flask import current_app as app

from app.contracts.smart_contract import SmartContract


class ERC20(SmartContract):
    def total_supply(self):
        app.logger.info("[GLM/GNT Contract] Getting total supply")
        return self.contract.functions.totalSupply().call()

    def balance_of(self, address):
        checksum_address = to_checksum_address(address)
        app.logger.info(
            f"[GLM/GNT Contract] Getting balance of address: {checksum_address}"
        )
        return self.contract.functions.balanceOf(checksum_address).call()

    def transfer(self, to_address, nonce):
        transaction = self.contract.functions.transfer(
            to_address, app.config["GLM_WITHDRAWAL_AMOUNT"]
        ).build_transaction({"from": app.config["GLM_SENDER_ADDRESS"], "nonce": nonce})
        signed_tx = self.w3.eth.account.sign_transaction(
            transaction, app.config["GLM_SENDER_PRIVATE_KEY"]
        )
        return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
