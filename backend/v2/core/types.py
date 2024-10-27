from typing import Annotated

from eth_utils import to_checksum_address
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from pydantic.functional_serializers import WrapSerializer
from pydantic.functional_validators import AfterValidator


class OctantModel(BaseModel):
    model_config = ConfigDict(frozen=True, alias_generator=to_camel)


# Address is a checksummed Ethereum address.
Address = Annotated[str, AfterValidator(to_checksum_address)]

BigInteger = Annotated[
    int, AfterValidator(int), WrapSerializer(lambda x, y, z: str(x), str)
]
