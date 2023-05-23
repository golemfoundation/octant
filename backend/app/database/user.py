from eth_utils import to_checksum_address

from app.database.models import User
from app.extensions import db


def get_all():
    return User.query.all()


def get_by_address(user_address):
    return User.query.filter_by(address=to_checksum_address(user_address)).first()


def add_user(user_address):
    user = User(address=to_checksum_address(user_address))
    db.session.add(user)

    return user


def get_or_add_user(user_address):
    user = get_by_address(user_address)
    if not user:
        user = add_user(user_address)

    return user
