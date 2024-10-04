from app.infrastructure.database.models import User
from eth_utils import to_checksum_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


async def get_user_by_address(session: AsyncSession, user_address: str) -> User | None:
    user_address = to_checksum_address(user_address)

    import time
    start = time.time()

    result = await session.scalar(
        select(User).filter(User.address == user_address).limit(1)
    )

    # result = await session.execute(select(User).filter(User.address == user_address))
    print("get_user_by_address", time.time() - start)
    print("result", result)

    return result
