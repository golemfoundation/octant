from contracts import Epochs

epochs_contract = Epochs()


def get_previous_epoch():
    current_octant_epoch = epochs_contract.get_current_epoch()
    return current_octant_epoch - 1
