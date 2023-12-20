from abc import abstractmethod, ABC
from dataclasses import dataclass

from app.v2.context.context import EpochContext


@dataclass
class StakingProceedsService(ABC):
    @abstractmethod
    def get_staking_proceeds(self, context: EpochContext) -> int:
        pass
