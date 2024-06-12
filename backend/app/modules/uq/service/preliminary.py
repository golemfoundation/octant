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
class Epoch0Whitelist(Protocol):
    def exists(self, context: Context, address: str) -> bool:
        ...


@runtime_checkable
class IdentityCallWhitelist(Protocol):
    def exists(self, context: Context, address: str) -> bool:
        ...


class PreliminaryUQ(Model):
    antisybil: Antisybil
    epoch0_whitelist: Epoch0Whitelist
    identity_call_whitelist: IdentityCallWhitelist

    def calculate(self, context: Context, address: str) -> float:
        gp_score = self._get_gp_score(context, address)
        has_epoch0_poap = self.epoch0_whitelist.exists(context, address)
        passed_identity_call = self.identity_call_whitelist.exists(context, address)
        num_of_donations = database.allocations.get_user_allocation_epoch_count(address)

        return calculate_uq(
            passed_identity_call, has_epoch0_poap, num_of_donations, gp_score, Scores()
        )

    def _get_gp_score(self, context: Context, address: str) -> float:
        antisybil_status = self.antisybil.get_antisybil_status(context, address)
        if antisybil_status is None:
            return 0.0
        return antisybil_status[0]
