from app.pydantic import Model

from app.infrastructure import database


class UserAllocationsHistory(Model):
    def get_next_user_nonce(self, user_address: str) -> int:
        allocation_request = database.allocations.get_user_last_allocation_request(
            user_address
        )
        return 0 if allocation_request is None else allocation_request.nonce + 1
