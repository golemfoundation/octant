from datetime import datetime
from typing import Protocol, Optional, Tuple, runtime_checkable

from app.context.manager import Context
from app.infrastructure import database
from app.modules.uq.core import calculate_uq, Scores
from app.pydantic import Model


@runtime_checkable
class Antisybil(Protocol):
    def get_antisybil_status(
        self, _: Context, user_address: str
    ) -> Optional[Tuple[float, datetime]]:
        ...


@runtime_checkable
class Epoch0Poap(Protocol):
    def has_poap(self, context: Context, address: str) -> bool:
        ...


@runtime_checkable
class IdentityPoap(Protocol):
    def has_poap(self, context: Context, address: str) -> bool:
        ...


class PreliminaryUQ(Model):
    antisybil: Antisybil
    epoch0_poap: Epoch0Poap
    identity_poap: IdentityPoap

    def calculate(self, context: Context, address: str) -> float:
        gp_score = self._get_gp_score(context, address)
        has_identity_poap = self.epoch0_poap.has_poap(context, address)
        has_epoch_zero_poap = self.identity_poap.has_poap(context, address)
        num_of_donations = database.allocations.get_user_allocation_epoch_count(address)

        return calculate_uq(
            has_epoch_zero_poap, has_identity_poap, num_of_donations, gp_score, Scores()
        )

    def _get_gp_score(self, context: Context, address: str) -> float:
        antisybil_status = self.antisybil.get_antisybil_status(context, address)
        if antisybil_status is None:
            return 0.0
        return antisybil_status[0]
