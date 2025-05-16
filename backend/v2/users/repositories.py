from sqlalchemy import exists
from app.infrastructure.database.models import User, UserConsents
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from v2.core.types import Address


async def get_user_by_address(
    session: AsyncSession, user_address: Address
) -> User | None:
    """Get a user object by their address. Useful for all other operations related to a user."""

    result = await session.scalar(
        select(User).filter(User.address == user_address).limit(1)
    )
    return result


async def get_user_tos_consent_status(
    session: AsyncSession, user_address: Address
) -> bool:
    """Get a user's Terms of Service consent status."""

    result = await session.scalar(
        select(
            exists().where(
                UserConsents.user_id == User.id, User.address == user_address
            )
        )
    )

    return bool(result)


async def get_or_create_user(
    session: AsyncSession,
    user_address: Address,
) -> User:
    user = await get_user_by_address(session, user_address)
    if not user:
        user = User(address=user_address)
        session.add(user)
        await session.flush()
        await session.refresh(user)

    return user


async def add_user_tos_consent(
    session: AsyncSession,
    user_address: Address,
    ip_address: str,
) -> None:
    """Add a user's Terms of Service consent."""

    # Get or create the user
    user = await get_or_create_user(session, user_address)

    # Add the consent
    consent = UserConsents(ip=ip_address, user_id=user.id)
    session.add(consent)
    await session.commit()
