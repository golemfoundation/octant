from datetime import datetime
from decimal import Decimal
from typing import Protocol, List, Optional, Tuple, runtime_checkable

from app.context.manager import Context
from app.infrastructure.database.uniqueness_quotient import (
    get_uq_by_address,
    save_uq_from_address,
)
from app.modules.uq.core import calculate_uq
from app.pydantic import Model


@runtime_checkable
class Passport(Protocol):
    def get_antisybil_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[float, datetime]]:
        ...


@runtime_checkable
class Holonym(Protocol):
    def get_sbt_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[bool, List[str]]]:
        ...


@runtime_checkable
class UserBudgets(Protocol):
    def get_budget(self, context: Context, user_address: str) -> int:
        ...


class PreliminaryUQ(Model):
    passport: Passport
    holonym: Holonym
    budgets: UserBudgets
    uq_threshold: int

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

        return calculate_uq(gp_score, self.uq_threshold)

    def _get_gp_score(self, context: Context, address: str) -> float:
        passport_status = self.passport.get_antisybil_status(context, address)
        if passport_status is None:
            return 0.0
        return passport_status[0]
