import random
import string

from pydantic import TypeAdapter

from v2.core.types import Address


def generate_random_eip55_address() -> Address:
    """
    Generate a random checksum address.
    """
    return TypeAdapter(Address).validate_python(
        "0x" + "".join(random.choices(string.hexdigits, k=40)).lower()
    )
