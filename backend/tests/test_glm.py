import pytest
from unittest.mock import MagicMock
from app.contracts.erc20 import ERC20
from app.core.glm import get_current_glm_supply

mock_glm = MagicMock(spec=ERC20)
mock_gnt = MagicMock(spec=ERC20)


@pytest.fixture(autouse=True)
def patch_glm_and_gnt(monkeypatch):
    monkeypatch.setattr("app.core.glm.glm", mock_glm)
    monkeypatch.setattr("app.core.glm.gnt", mock_gnt)


def test_get_glm_supply():
    # Set the desired mocked values for glm and gnt
    glm_total_supply = 1_000_000_000 * 10**18
    gnt_total_supply = 1_000_000_000 * 10**18
    glm_balance_of_burn = 400_000 * 10**18
    gnt_balance_of_burn = 1_000_000 * 10**18

    # Configure mocked instances to return the desired values
    mock_glm.total_supply.return_value = glm_total_supply
    mock_gnt.total_supply.return_value = gnt_total_supply
    mock_glm.balance_of.return_value = glm_balance_of_burn
    mock_gnt.balance_of.return_value = gnt_balance_of_burn

    # Call the function and assert that the result is as expected
    result = get_current_glm_supply()
    expected_result = (glm_total_supply + gnt_total_supply) - (
        glm_balance_of_burn + gnt_balance_of_burn
    )
    assert result == expected_result
