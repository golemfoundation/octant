from eth_typing import ChecksumAddress
from web3 import AsyncWeb3
from web3.contract import AsyncContract
from web3.types import ABI


class SmartContract:
    def __init__(self, w3: AsyncWeb3, abi: ABI, address: ChecksumAddress) -> None:
        self.abi = abi
        self.w3 = w3
        self.contract: AsyncContract = w3.eth.contract(address=address, abi=abi)
