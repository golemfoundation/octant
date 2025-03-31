import pytest

from app.modules.dto import ScoreDelegationPayload
from tests.helpers.constants import USER1_ADDRESS, USER2_ADDRESS
from unittest.mock import patch


@pytest.fixture()
def payload():
    return ScoreDelegationPayload(
        primary_addr=USER2_ADDRESS,
        secondary_addr=USER1_ADDRESS,
        primary_addr_signature="0x42a06ccb1a0ade7bd897687a10f638d32c794ca180df64ba8284933792a21a1165cbe8678970dc3657e09c0c53be1f5965573bffa47b1ec9dc9da191ca6024361b",
        secondary_addr_signature="0xc464be5ca06fe6a5ffe24cb1f73bf151cafdc9be11648833443859a6ba2dce465303629ed7d3dc08375235290c56b3b7a19e4d7235bc5a903302d0dead5976381b",
    )


@pytest.fixture(autouse=True)
def mock_fetch_streams():
    """Mock fetch_streams to return an empty list for all API tests."""
    with patch("app.infrastructure.sablier.events.fetch_streams") as mock:
        mock.return_value = []
        yield mock
