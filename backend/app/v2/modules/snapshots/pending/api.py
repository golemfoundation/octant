from abc import abstractmethod, ABC
from dataclasses import dataclass
from typing import Optional

from app.v2.context.context import EpochContext
from app.v2.modules.user.deposits.api import UserDepositsService


@dataclass
class SnapshotsService(ABC):
    user_deposits_service: UserDepositsService

    @abstractmethod
    def create_pending_epoch_snapshot(self, context: EpochContext) -> Optional[int]:
        pass
