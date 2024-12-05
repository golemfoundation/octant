import random
import string

from eth_typing import ChecksumAddress
from web3 import Web3


def generate_random_eip55_address() -> ChecksumAddress:
    """
    Generate a random checksummed address.
    """
    return Web3.to_checksum_address(
        "0x" + "".join(random.choices(string.hexdigits, k=40)).lower()
    )
