from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model


class WhitelistEpoch0(Model):
    def has_poap(self, _: Context, address: str) -> bool:
        epoch0_claims = database.claims.get_all(exclude_sybils=True)
        return address in epoch0_claims
