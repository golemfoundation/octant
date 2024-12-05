import random
import string

from web3 import Web3

from v2.core.types import Address


def generate_random_eip55_address() -> Address:
    """
    Generate a random checksum address.
    """
    return Web3.to_checksum_address(
        "0x" + "".join(random.choices(string.hexdigits, k=40)).lower()
    )
