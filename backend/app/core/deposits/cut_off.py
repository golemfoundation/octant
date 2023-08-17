WEIGHTED_AVERAGE_CUT_OFF = 10 * 10**18
WEIGHTED_AVERAGE_MIN_LOCKED_VALUE = 100 * 10**18

MIN_VALUE_CUT_OFF = 100 * 10**18


def apply_weighted_average_cutoff(locked_amount: int, effective_amount: int) -> int:
    if locked_amount < WEIGHTED_AVERAGE_MIN_LOCKED_VALUE:
        return 0

    return _apply_cutoff(effective_amount, WEIGHTED_AVERAGE_CUT_OFF)


def apply_min_value_cutoff(effective_amount: int) -> int:
    return _apply_cutoff(effective_amount, MIN_VALUE_CUT_OFF)


def _apply_cutoff(amount: int, cutoff: int) -> int:
    return amount if amount >= cutoff else 0
