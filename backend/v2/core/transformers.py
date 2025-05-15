from pydantic import TypeAdapter

from v2.core.types import Address, BigInteger


transform_to_checksum_address = TypeAdapter(Address).validate_python

transform_to_biginteger = TypeAdapter(BigInteger).validate_python
