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
        select(UserConsents)
        .join(User, User.id == UserConsents.user_id)
        .filter(User.address == user_address)
        .order_by(UserConsents.created_at.desc())
        .limit(1)
    )

    return result is not None


async def add_user_tos_consent(
    session: AsyncSession,
    user_address: Address,
    ip_address: str,
) -> None:
    """Add a user's Terms of Service consent."""

    # Get or create the user
    user = await get_user_by_address(session, user_address)
    if not user:
        user = User(address=user_address)
        session.add(user)
        await session.commit()
        await session.refresh(user)

    # Add the consent
    consent = UserConsents(ip=ip_address, user_id=user.id)
    session.add(consent)
    await session.commit()
