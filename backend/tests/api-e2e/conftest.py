import pytest

from app.modules.dto import ScoreDelegationPayload
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS


@pytest.fixture()
def payload():
    return ScoreDelegationPayload(
        primary_addr=USER1_ADDRESS,
        secondary_addr=USER2_ADDRESS,
        primary_addr_signature="0x4c7f3b8d06ef3abbe6f5c0762fda01517c62709a3e0bde7ae19a945d3359b0673197db2dabeb20babb9b71c2cbb7e83cfa4cb3078c9bcdc284dcd605ebe89ddc1b",
        secondary_addr_signature="0x5e7e86d5acea5cc431b8d148842e21584a7afe16b7de3b5586d20f5de97179f549726baa021dcaf6220ee5116c579df9d40375fa58d3480390289df6a088b9ec1b",
    )
