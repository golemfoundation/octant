from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model


class WhitelistEpoch0(Model):
    def exists(self, _: Context, address: str) -> bool:
        return database.claims.claim_exists(address, exclude_sybils=True)
