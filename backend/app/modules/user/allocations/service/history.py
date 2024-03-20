from app.pydantic import Model

from app.infrastructure import database
from app.modules.user.allocations import core


class UserAllocationsHistory(Model):
    def get_next_user_nonce(self, user_address: str) -> int:
        allocation_request = database.allocations.get_user_last_allocation_request(
            user_address
        )
        return core.next_allocation_nonce(allocation_request)
