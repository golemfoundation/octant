from decimal import Decimal
from v2.core.types import Address, OctantModel


class EpochPatronsResponseV1(OctantModel):
    patrons: list[Address]


class UQResponseV1(OctantModel):
    uniqueness_quotient: Decimal


class UserUQResponseV1(OctantModel):
    user_address: Address
    uniqueness_quotient: Decimal


class AllUsersUQResponseV1(OctantModel):
    uqs_info: list[UserUQResponseV1]


class AntisybilStatusResponseV1(OctantModel):
    status: str
    score: Decimal | None
    expires_at: str | None  # timestamp
    is_on_time_out_list: bool | None


class TosStatusResponseV1(OctantModel):
    accepted: bool


class TosStatusRequestV1(OctantModel):
    signature: str


class PatronModeRequestV1(OctantModel):
    signature: str


class PatronModeResponseV1(OctantModel):
    status: bool
