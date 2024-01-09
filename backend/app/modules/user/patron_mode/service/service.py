from typing import Protocol, List

from app.context.context import Context


class UserPatronModeService(Protocol):
    def get_all_patrons_addresses(self, context: Context) -> List[str]:
        ...
