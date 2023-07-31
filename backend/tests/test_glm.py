from app.core.glm import get_current_glm_supply
from tests.conftest import MOCK_GLM, MOCK_GNT


def test_get_glm_supply(patch_glm_and_gnt):
    # Set the desired mocked values for glm and gnt
    glm_total_supply = 700_000_000 * 10**18
    gnt_total_supply = 300_000_000 * 10**18
    glm_balance_of_burn = 400_000 * 10**18
    gnt_balance_of_burn = 1_000_000 * 10**18

    # Configure mocked instances to return the desired values
    MOCK_GLM.total_supply.return_value = glm_total_supply
    MOCK_GNT.total_supply.return_value = gnt_total_supply
    MOCK_GLM.balance_of.return_value = glm_balance_of_burn
    MOCK_GNT.balance_of.return_value = gnt_balance_of_burn

    # Call the function and assert that the result is as expected
    result = get_current_glm_supply()
    expected_result = (glm_total_supply + gnt_total_supply) - (
        glm_balance_of_burn + gnt_balance_of_burn
    )
    assert result == expected_result
