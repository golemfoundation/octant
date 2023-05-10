from app.constants import BURN_ADDRESS
from app.contracts.erc20 import glm, gnt


def get_current_glm_supply() -> int:
    return (
        glm.total_supply()
        + gnt.total_supply()
        - glm.balance_of(BURN_ADDRESS)
        - gnt.balance_of(BURN_ADDRESS)
    )
