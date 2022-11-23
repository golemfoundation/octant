import pytest

import epochs
from epochs import get_previous_epoch, get_last_block_in_epoch


class EpochsContractMock():
    def start(self):
        return 2

    def epoch_duration(self):
        return 300

    def get_current_epoch(self):
        return 2


def test_get_previous_epoch():
    epochs.epochs_contract = EpochsContractMock()
    previous_epoch = get_previous_epoch()
    assert previous_epoch == 1


@pytest.mark.parametrize("epoch,last_block_expected", [(0, None), (1, 301), (2, 601), (3, 901)])
def test_get_last_block_in_epoch(epoch, last_block_expected):
    epochs.epochs_contract = EpochsContractMock()
    last_block = get_last_block_in_epoch(epoch)
    assert last_block == last_block_expected
