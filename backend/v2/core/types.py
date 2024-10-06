from typing import Annotated
from eth_utils import to_checksum_address
from pydantic.functional_validators import AfterValidator


# Address is a checksummed Ethereum address.
Address = Annotated[str, AfterValidator(to_checksum_address)]
