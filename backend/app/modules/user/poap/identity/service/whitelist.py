from app.context.manager import Context
from app.infrastructure import database
from app.pydantic import Model


class WhitelistIdentityCall(Model):
    def has_poap(self, _: Context, address: str) -> bool:
        return database.identity_calls.is_address_verified(address)
