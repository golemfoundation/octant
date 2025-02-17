from v2.core.types import Address, OctantModel


class EpochPatronsResponseV1(OctantModel):
    patrons: list[Address]
