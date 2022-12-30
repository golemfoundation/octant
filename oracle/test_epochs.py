import epochs
from epochs import get_previous_epoch


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
