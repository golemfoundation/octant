import hashlib
from typing import NamedTuple
from flask import current_app as app

from eth_utils import to_checksum_address


class HashedAddresses(NamedTuple):
    primary_addr_hash: str
    secondary_addr_hash: str
    both_hash: str


def get_hashed_addresses(
    primary_addr: str, secondary_addr: str, normalize: bool = True
) -> HashedAddresses:
    return hash_addresses(
        primary_addr,
        secondary_addr,
        app.config["DELEGATION_SALT"],
        app.config["DELEGATION_SALT_PRIMARY"],
        normalize,
    )


def hash_addresses(
    primary: str,
    secondary: str,
    salt: str,
    salt_primary: str,
    normalize: bool = True,
) -> HashedAddresses:
    if normalize:
        primary = to_checksum_address(primary)
        secondary = to_checksum_address(secondary)
    primary_addr_data = salt_primary + primary
    secondary_addr_data = salt + secondary

    hashed_primary = hashlib.sha256(primary_addr_data.encode()).hexdigest()
    hashed_secondary = hashlib.sha256(secondary_addr_data.encode()).hexdigest()
    hashed_both = hashlib.sha256(
        (primary_addr_data + secondary_addr_data).encode()
    ).hexdigest()

    return HashedAddresses(hashed_primary, hashed_secondary, hashed_both)
