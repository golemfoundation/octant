import random
import string

from v2.core.transformers import transform_to_checksum_address
from v2.core.types import Address


def generate_random_eip55_address() -> Address:
    """
    Generate a random checksum address.
    """
    return transform_to_checksum_address(
        "0x" + "".join(random.choices(string.hexdigits, k=40)).lower()
    )
