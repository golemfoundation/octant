import logging

from v2.core.contracts import SmartContract


class ProjectsContracts(SmartContract):
    async def get_project_addresses(self, epoch_number: int) -> list[str]:
        logging.debug(
            f"[Projects contract] Getting project addresses for epoch: {epoch_number}"
        )
        return await self.contract.functions.getProposalAddresses(epoch_number).call()

    async def get_project_cid(self):
        logging.debug("[Projects contract] Getting projects CID")
        return await self.contract.functions.cid().call()


PROJECTS_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "_epoch", "type": "uint256"}],
        "name": "getProposalAddresses",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "cid",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
]
