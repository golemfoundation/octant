from typing import List

from flask import current_app as app

from app.infrastructure.contracts.smart_contract import SmartContract


class Projects(SmartContract):
    def get_project_addresses(self, epoch: int) -> List[str]:
        app.logger.debug(
            f"[Projects contract] Getting project addresses for epoch: {epoch}"
        )
        return self.contract.functions.getProposalAddresses(epoch).call()

    def get_project_cid(self):
        app.logger.debug("[Projects contract] Getting projects CID")
        return self.contract.functions.cid().call()
