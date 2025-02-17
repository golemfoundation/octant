import logging

from v2.core.types import Address
from v2.core.transformers import transform_to_checksum_address
from v2.core.contracts import SmartContract


class ProjectsContracts(SmartContract):
    async def get_project_addresses(self, epoch_number: int) -> list[Address]:
        logging.debug(
            f"[Projects contract] Getting project addresses for epoch: {epoch_number}"
        )
        addresses = await self.contract.functions.getProposalAddresses(
            epoch_number
        ).call()
        return [transform_to_checksum_address(address) for address in addresses]

    async def get_project_cid(self) -> str:
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
