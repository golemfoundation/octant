from app.context.manager import Context
from app.pydantic import Model


class IdentityPoap(Model):
    def has_poap(self, context: Context, address: str) -> bool:
        # TODO implement identity poap check
        ...
