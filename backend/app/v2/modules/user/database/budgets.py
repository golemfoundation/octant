from typing import List, Dict, Tuple

from app import database
from app.database.models import Budget
from app.extensions import db


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


def get_all_by_epoch(epoch: int) -> Dict[str, Budget]:
    budgets = Budget.query.filter_by(epoch=epoch).all()
    return {budget.user.address: budget for budget in budgets}
