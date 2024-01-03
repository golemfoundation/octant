from typing import List

from app.exceptions import UserNotFound
from app.infrastructure import database
from app.infrastructure.database import user as user_db
from app.legacy.utils.time import Timestamp


def get_patron_mode_status(user_address: str) -> bool:
    # double check that user exists
    user = user_db.get_by_address(user_address)
    if not user:
        raise UserNotFound(user_address)

    last_event = database.patrons.get_last_event(user_address)

    return last_event.patron_mode_enabled if last_event is not None else False


def toggle_patron_mode(user_address: str) -> bool:
    current_status = get_patron_mode_status(user_address)
    next_status = not current_status

    database.patrons.add_patron_mode_event(user_address, next_status)

    return next_status


def get_patrons_at_timestamp(timestamp: Timestamp) -> List[str]:
    return database.patrons.get_all_patrons_at_timestamp(timestamp.datetime())
