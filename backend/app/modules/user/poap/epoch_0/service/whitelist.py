from app.context.manager import Context
from app.pydantic import Model


class WhitelistEpoch0(Model):
    def has_poap(self, context: Context, address: str) -> bool:
        ...
