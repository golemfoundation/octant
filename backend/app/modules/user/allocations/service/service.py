from typing import Protocol, List

from app.context.context import Context


class UserAllocationsService(Protocol):
    def get_all_donors_addresses(self, context: Context) -> List[str]:
        ...
