from contracts import Epochs

epochs_contract = Epochs()


def get_previous_epoch():
    current_hexagon_epoch = epochs_contract.get_current_epoch()
    return current_hexagon_epoch - 1
