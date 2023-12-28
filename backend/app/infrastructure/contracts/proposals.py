from flask import current_app as app

from app.infrastructure.contracts.smart_contract import SmartContract


class Proposals(SmartContract):
    def get_proposal_addresses(self, epoch):
        app.logger.debug(
            f"[Proposals contract] Getting proposal addresses for epoch: {epoch}"
        )
        return self.contract.functions.getProposalAddresses(epoch).call()
