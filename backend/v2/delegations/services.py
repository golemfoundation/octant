from dataclasses import dataclass
import hashlib

from sqlalchemy.ext.asyncio import AsyncSession
from v2.delegations.repositories import contains_hashed_address
from v2.core.types import Address


@dataclass
class DelegationService:
    session: AsyncSession
    salt_primary: str
    salt_secondary: str

    def hash_primary(self, address: Address) -> str:
        return hashlib.sha256((self.salt_primary + address).encode()).hexdigest()

    def hash_secondary(self, address: Address) -> str:
        return hashlib.sha256((self.salt_secondary + address).encode()).hexdigest()

    async def exists(self, address: Address) -> bool:
        """
        Checks if the address has delagation associated with it.

        Checks if ScoreDelegation record exists for the address' primary or secondary hash.
        """
        return await contains_hashed_address(
            self.session, self.hash_primary(address)
        ) or await contains_hashed_address(self.session, self.hash_secondary(address))
