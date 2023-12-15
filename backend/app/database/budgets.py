from typing import Optional, Dict, List, Tuple

from eth_utils import to_checksum_address

from app import db, database
from app.database.models import User, Budget


def get_all_by_epoch(epoch: int) -> Dict[str, Budget]:
    budgets = Budget.query.filter_by(epoch=epoch).all()
    return {budget.user.address: budget for budget in budgets}


def get_by_users_addresses_and_epoch(
    users_addresses: List[str], epoch: int
) -> Dict[str, Budget]:
    query = Budget.query.join(User)
    query = query.filter(User.address.in_(users_addresses), Budget.epoch == epoch)
    budgets = query.all()
    return {budget.user.address: budget for budget in budgets}


def get_by_user_address_and_epoch(user_address: str, epoch: int) -> Optional[Budget]:
    query = Budget.query.join(User)
    query = query.filter(
        User.address == to_checksum_address(user_address), Budget.epoch == epoch
    )

    return query.one_or_none()


def add(epoch: int, user: User, budget: int):
    budget = Budget(
        epoch=epoch,
        user=user,
        budget=str(budget),
    )

    db.session.add(budget)


def save_budgets(epoch: int, budgets: List[Tuple[str, int]]):
    for address, budget in budgets:
        user = database.user.get_or_add_user(address)
        user.budgets.append(
            Budget(
                epoch=epoch,
                budget=str(budget),
            )
        )
        db.session.add(user)
