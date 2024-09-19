import re


def build_filename(prefix: str, epoch: int) -> str:
    json_filename = f"{prefix}_epoch_{epoch}.json"

    return json_filename


def is_valid_ethereum_address(address):
    """
    Validates if the provided string is a valid Ethereum address.

    :param address: The address string to validate.
    :return: True if valid, False otherwise.
    """
    # Ethereum addresses are 42 characters long (including '0x') and hexadecimal
    pattern = re.compile(r"^0x[a-fA-F0-9]{40}$")
    return bool(pattern.match(address))
