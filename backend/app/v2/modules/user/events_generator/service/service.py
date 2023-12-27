from typing import List, Dict, Protocol

from app.v2.context.context import Context


class EventsGenerator(Protocol):
    def get_user_events(self, context: Context, user_address: str = None) -> List[Dict]:
        ...

    def get_all_users_events(self, context: Context) -> Dict[str, List[Dict]]:
        ...
