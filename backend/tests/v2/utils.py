import random
import string

from app.infrastructure.database.models import Allocation, AllocationRequest, User
from pydantic import TypeAdapter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from v2.core.types import Address, BigInteger


class FakeUser:
    @classmethod
    async def get_or_create(cls, session: AsyncSession, address: Address) -> User:
        """
        Get or create a user with the given address.
        """

        address = TypeAdapter(Address).validate_python(address)

        user = await session.scalar(select(User).filter(User.address == address))
        if user is None:
            user = User(address=address)
            session.add(user)
            await session.commit()

        return user

    @classmethod
    async def GetAlice(cls, session: AsyncSession) -> User:
        """
        Get or create Alice's user.
        """
        return await cls.get_or_create(
            session, "0xA0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0"
        )

    @classmethod
    async def GetBob(cls, session: AsyncSession) -> User:
        """
        Get or create Bob's user.
        """
        return await cls.get_or_create(
            session, "0xB0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0B0"
        )

    @classmethod
    async def GetCharlie(cls, session: AsyncSession) -> User:
        """
        Get or create Charlie's user.
        """
        return await cls.get_or_create(
            session, "0xC0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0"
        )


class FakeAllocation:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        user_address: Address,
        project_address: Address,
        amount: BigInteger,
        epoch: int,
    ) -> Allocation:
        """
        Create an allocation for the given user and project.
        Creates a new user if it doesn't exist.
        """

        user = await FakeUser.get_or_create(session, user_address)

        allocation = Allocation(
            epoch=epoch,
            user_id=user.id,
            project_address=project_address,
            amount=amount,
            nonce=1,
        )
        session.add(allocation)
        return allocation

    @classmethod
    async def of_(
        cls,
        session: AsyncSession,
        user: User | Address,
        epoch: int,
        project_address: Address | None = None,
        amount: BigInteger | None = None,
    ) -> Allocation:
        """
        Create an allocation for the given user and epoch.
        If parameters are not provided we randomly generate them.
        """

        if not isinstance(user, User):
            user = await FakeUser.get_or_create(session, user)

        if project_address is None:
            project_address = "0x" + "".join(random.choices(string.hexdigits, k=40))

        if amount is None:
            amount = random.randint(1, 100000000)

        return await cls.create(
            session,
            user.address,
            TypeAdapter(Address).validate_python(project_address),
            TypeAdapter(BigInteger).validate_python(amount),
            epoch,
        )


class FakeAllocationRequest:
    @classmethod
    async def create(
        cls,
        session: AsyncSession,
        user: User | Address,
        epoch: int,
        nonce: int,
        signature: str,
        is_manually_edited: bool,
        leverage: float | None = None,
    ) -> AllocationRequest:
        """
        Create an allocation request for the given user and epoch.
        """

        if not isinstance(user, User):
            user = await FakeUser.get_or_create(session, user)

        allocation_request = AllocationRequest(
            user_id=user.id,
            nonce=nonce,
            epoch=epoch,
            signature=signature,
            is_manually_edited=is_manually_edited,
            leverage=leverage,
        )
        session.add(allocation_request)
        return allocation_request
