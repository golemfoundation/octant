from typing import List, Dict, Protocol

from app.context.context import Context
from app.engine.user.effective_deposit import DepositEvent


class EventsGenerator(Protocol):
    def get_user_events(
        self, context: Context, user_address: str
    ) -> List[DepositEvent]:
        ...

    def get_all_users_events(self, context: Context) -> Dict[str, List[DepositEvent]]:
        ...
