from pydantic import TypeAdapter

from v2.core.types import Address


transform_to_checksum_address = TypeAdapter(Address).validate_python
