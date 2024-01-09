from typing import Protocol, Dict

from app.context.context import Context


class UserRewardsService(Protocol):
    def get_unused_rewards(self, context: Context) -> Dict[str, int]:
        ...
