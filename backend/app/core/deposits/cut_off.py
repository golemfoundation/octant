CUT_OFF = 100 * 10**18


def apply_cutoff(amount: int) -> int:
    return amount if amount >= CUT_OFF else 0
