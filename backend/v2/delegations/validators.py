from app.exceptions import DelegationCheckWrongParams
from v2.core.types import Address
from v2.core.transformers import transform_to_checksum_address


def validate_comma_separated_addresses(addresses: str) -> list[Address]:
    """
    Convert comma-separated addresses to a list of checksum addresses
    """

    tokens = addresses.split(",")
    if not (2 <= len(tokens) <= 10):
        raise DelegationCheckWrongParams()

    return [transform_to_checksum_address(token) for token in tokens]
