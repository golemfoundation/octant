from datetime import datetime
from decimal import Decimal
from typing import Protocol, Optional, Tuple, runtime_checkable

from app.context.manager import Context
from app.infrastructure import database
from app.infrastructure.database.uniqueness_quotient import (
    get_uq_by_address,
    save_uq_from_address,
)
from app.modules.uq.core import calculate_uq, Scores
from app.pydantic import Model


@runtime_checkable
class Antisybil(Protocol):
    def get_antisybil_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[float, datetime]]:
        ...


@runtime_checkable
class Epoch0Whitelist(Protocol):
    def exists(self, context: Context, address: str) -> bool:
        ...


class PreliminaryUQ(Model):
    antisybil: Antisybil
    epoch0_whitelist: Epoch0Whitelist

    def retrieve(self, context: Context, user_address: str) -> Decimal:
        """
        Calculates UQ when the user hasn't allocated to any project yet.
        If the user has allocated to any project, the UQ is based on the first allocation.
        """
        epoch_num = context.epoch_details.epoch_num

        uq_score = get_uq_by_address(user_address, epoch_num)
        if not uq_score:
            uq_score = self.calculate(context, user_address)
            save_uq_from_address(user_address, epoch_num, uq_score)
        else:
            uq_score = uq_score.validated_score

        return uq_score

    def calculate(self, context: Context, address: str) -> Decimal:
        gp_score = self._get_gp_score(context, address)
        has_epoch0_poap = self.epoch0_whitelist.exists(context, address)

        return calculate_uq(has_epoch0_poap, gp_score)

    def _get_gp_score(self, context: Context, address: str) -> float:
        antisybil_status = self.antisybil.get_antisybil_status(context, address)
        if antisybil_status is None:
            return 0.0
        return antisybil_status[0]
