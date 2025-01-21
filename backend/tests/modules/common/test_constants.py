from app.constants import GUEST_LIST, TIMEOUT_LIST_NOT_MAINNET, TIMEOUT_LIST


def test_addresses_are_lowercase():
    """
    NOTE:
    It might seem like a silly test, but it's important to
    ensure that the addresses are always in lowercase.
    For past couple of allocation windows we struggled with
    issues in some ways related to this.
    """

    for address in GUEST_LIST:
        assert (
            address.lower() == address
        ), f"Guest list address {address} is not lowercase"

    for address in TIMEOUT_LIST:
        assert (
            address.lower() == address
        ), f"Timeout list address {address} is not lowercase"

    for address in TIMEOUT_LIST_NOT_MAINNET:
        assert (
            address.lower() == address
        ), f"Timeout list not-mainnet address {address} is not lowercase"
