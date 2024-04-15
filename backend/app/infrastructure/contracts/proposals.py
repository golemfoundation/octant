from typing import List

from flask import current_app as app

from app.infrastructure.contracts.smart_contract import SmartContract


class Proposals(SmartContract):
    def get_proposal_addresses(self, epoch: int) -> List[str]:
        app.logger.debug(
            f"[Proposals contract] Getting proposal addresses for epoch: {epoch}"
        )
        return self.contract.functions.getProposalAddresses(epoch).call()

    def get_proposals_cid(self):
        app.logger.debug("[Proposals contract] Getting proposals CID")
        return self.contract.functions.cid().call()
