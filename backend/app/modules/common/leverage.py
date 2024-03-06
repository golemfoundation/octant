def calculate_leverage(matched: int, allocated: int) -> float:
    return matched / allocated if allocated else 0
