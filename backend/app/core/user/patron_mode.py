from app.database import user as user_db
from app.exceptions import UserNotFound


def get_patron_mode_status(user_address: str) -> bool:
    user = user_db.get_by_address(user_address)
    if not user:
        raise UserNotFound(user_address)

    return user.patron_mode


def toggle_patron_mode(user_address: str) -> bool:
    status = user_db.toggle_patron_mode(user_address)
    return status
