from dataclasses import dataclass
import hashlib
from itertools import permutations

from sqlalchemy.ext.asyncio import AsyncSession
from v2.delegations.repositories import contains_hashed_address, find_hashes, save_delegation
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

    def hash_both(self, primary: Address, secondary: Address) -> str:
        return hashlib.sha256(
            (self.salt_primary + primary + self.salt_secondary + secondary).encode()
        ).hexdigest()

    async def exists(self, address: Address) -> bool:
        """
        Checks if the address has delagation associated with it.

        Checks if ScoreDelegation record exists for the address' primary or secondary hash.
        """
        return await contains_hashed_address(
            self.session, self.hash_primary(address)
        ) or await contains_hashed_address(self.session, self.hash_secondary(address))

    async def find_all(self, addresses: list[Address]) -> list[tuple[Address, Address]]:
        """
        Find all delegations for any combination of given addresses.
        Returns a set of tuples (secondary, primary) that have a delegation associated with it.
        """

        # Create a dict of hash: (secondary, primary)
        hashes = {
            self.hash_both(primary, secondary): (primary, secondary)
            for secondary, primary in permutations(addresses, 2)
        }

        # Check if ANY of the hashes exist in the database
        db_hashes = await find_hashes(self.session, list(hashes.keys()))

        # If there are no matches, return an empty list
        if not db_hashes:
            return []
        
        # Return all matches
        return [
            hashes[db_hash]
            for db_hash in db_hashes
        ]

    async def delegate(
            self,
            primary: Address,
            secondary: Address,
            primary_signature: str,
            secondary_signature: str,
        ) -> None:
            """
            Delegate UQ score from secondary address to primary address
            """

            # Validate signatures
            # hashed_addresses = get_hashed_addresses(
            #     payload.primary_addr, payload.secondary_addr
            # )
            # score, expires_at, stamps = self.antisybil.fetch_antisybil_status(
            #     context, payload.secondary_addr
            # )
            # secondary_budget = self.user_deposits_service.get_user_effective_deposit(
            #     context, payload.secondary_addr
            # )
            # self.verifier.verify(
            #     context,
            #     hashed_addresses=hashed_addresses,
            #     payload=payload,
            #     score=score,
            #     secondary_budget=secondary_budget,
            #     action_type=action,
            #     primary_addr=payload.primary_addr,
            #     timeout_list=self.timeout_list,
            # )
            # self.antisybil.update_antisybil_status(
            #     context, payload.primary_addr, score, expires_at, stamps
            # )


            primary_hash = self.hash_primary(primary)
            secondary_hash = self.hash_secondary(secondary)
            both_hash = self.hash_both(primary, secondary)

            await save_delegation(
                self.session, primary_hash, secondary_hash, both_hash
            )
