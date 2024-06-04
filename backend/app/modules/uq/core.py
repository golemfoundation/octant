THRESHOLD = 20


def calculate_uq(
    has_epoch_zero_poap: bool,
    has_identity_poap: bool,
    num_of_donations: int,
    gp_score: float,
) -> float:
    uq_score = 0

    if has_identity_poap:
        uq_score += 10
    if num_of_donations > 1:
        uq_score += 10
    if has_epoch_zero_poap:
        uq_score += 10

    total_uq_score = gp_score + uq_score

    if total_uq_score >= THRESHOLD:
        return 1.0
    else:
        return 0.2
