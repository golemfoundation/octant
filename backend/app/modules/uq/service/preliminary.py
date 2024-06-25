from datetime import datetime
from decimal import Decimal
from typing import Protocol, Optional, Tuple, runtime_checkable

from app.context.manager import Context
from app.infrastructure.database.uniqueness_quotient import (
    get_uq_by_address,
    save_uq_from_address,
)
from app.modules.uq.core import calculate_uq
from app.pydantic import Model
from flask import current_app as app


@runtime_checkable
class Antisybil(Protocol):
    def get_antisybil_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[float, datetime]]:
        ...


@runtime_checkable
class UserBudgets(Protocol):
    def get_budget(self, context: Context, user_address: str) -> int:
        ...


class PreliminaryUQ(Model):
    antisybil: Antisybil
    budgets: UserBudgets

    def retrieve(
        self, context: Context, user_address: str, should_save: bool = False
    ) -> Decimal:
        """
        Calculates UQ when the user hasn't allocated to any project yet.
        If the user has allocated to any project, the UQ is based on the first allocation.
        """
        epoch_num = context.epoch_details.epoch_num

        uq_score = get_uq_by_address(user_address, epoch_num)
        if uq_score:
            return uq_score.validated_score

        uq_score = self.calculate(context, user_address)

        if should_save:
            save_uq_from_address(user_address, epoch_num, uq_score)

        return uq_score

    def calculate(self, context: Context, user_address: str) -> Decimal:
        gp_score = self._get_gp_score(context, user_address)
        budget = self.budgets.get_budget(context, user_address)
        addresses = (
            app.config["ADDRESSES"].split(",") if app.config["ADDRESSES"] else []
        )

        return calculate_uq(gp_score, budget, user_address, addresses)

    def _get_gp_score(self, context: Context, address: str) -> float:
        antisybil_status = self.antisybil.get_antisybil_status(context, address)
        if antisybil_status is None:
            return 0.0
        return antisybil_status[0]
