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
