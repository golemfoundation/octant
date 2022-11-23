import pytest

import execution_layer
from execution_layer import should_update_oracle


@pytest.mark.parametrize("epoch,balance,expected_result",
                         [(0, 0, False), (0, 100, False), (1, 0, True), (1, 100, False)])
def test_if_should_update_oracle(epoch, balance, expected_result):
    class ExecutionLayerContractMock():
        def get_balance(self, epoch):
            return balance

    execution_layer.execution_layer_contract = ExecutionLayerContractMock()
    result = should_update_oracle(epoch)
    assert result == expected_result
