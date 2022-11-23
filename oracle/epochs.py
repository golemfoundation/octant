from contracts import Epochs

epochs_contract = Epochs()


def get_previous_epoch():
    current_hexagon_epoch = epochs_contract.get_current_epoch()
    return current_hexagon_epoch - 1


def get_last_block_in_epoch(epoch):
    if epoch == 0:
        return None

    start = epochs_contract.start()
    duration = epochs_contract.epoch_duration()
    return start + epoch * duration - 1
