THRESHOLD = 20
MIN_RETURN: float = 0.2
MAX_RETURN: float = 1.0


def calculate_uq(
    has_epoch_zero_poap: bool,
    gp_score: float,
) -> float:
    if gp_score >= THRESHOLD or has_epoch_zero_poap:
        return MAX_RETURN
    else:
        return MIN_RETURN
