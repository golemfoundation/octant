from typing import Protocol

from app.v2.context.context import Context


class StakingProceedsService(Protocol):
    def get_staking_proceeds(self, context: Context) -> int:
        ...
