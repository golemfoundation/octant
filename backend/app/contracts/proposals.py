from flask import current_app as app

from app.extensions import w3
from app.settings import config

abi = [
    {
        "inputs": [{"internalType": "uint256", "name": "_epoch", "type": "uint256"}],
        "name": "getProposalAddresses",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function",
    }
]


class Proposals:
    def __init__(self):
        self.contract = w3.eth.contract(
            address=config.PROPOSALS_CONTRACT_ADDRESS, abi=abi
        )

    def get_proposal_addresses(self, epoch):
        app.logger.debug(
            f"[Proposals contract] Getting proposal addresses for epoch: {epoch}"
        )
        return self.contract.functions.getProposalAddresses(epoch).call()


proposals = Proposals()
