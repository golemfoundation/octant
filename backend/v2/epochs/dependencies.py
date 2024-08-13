from web3 import AsyncWeb3
from .contracts import Epochs, EPOCHS_ABI


# TODO: cache
def get_epochs(w3: AsyncWeb3, epochs_contract_address: str) -> Epochs:

    return Epochs(w3, EPOCHS_ABI, epochs_contract_address)
