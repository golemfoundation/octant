from typing import List

from app.exceptions import InvalidProjectDetailsInput


def validate_project_details_input(epochs: str) -> List[int]:
    try:
        epochs = list(map(int, epochs.split(",")))
    except ValueError:
        raise InvalidProjectDetailsInput

    return epochs
