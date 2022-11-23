import pytest

import beacon_chain
from beacon_chain import should_update_oracle


@pytest.mark.parametrize("epoch,balance,expected_result",
                         [(0, 0, False), (0, 100, False), (1, 0, True), (1, 100, False)])
def test_if_should_update_oracle(epoch, balance, expected_result):
    class BeaconContractMock():
        def get_balance(self, epoch):
            return balance

    beacon_chain.beacon_contract = BeaconContractMock()
    result = should_update_oracle(epoch)
    assert result == expected_result
