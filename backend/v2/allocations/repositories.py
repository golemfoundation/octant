from collections import defaultdict
from datetime import datetime
from decimal import Decimal
from pydantic import TypeAdapter

from app.infrastructure.database.models import Allocation
from app.infrastructure.database.models import AllocationRequest as AllocationRequestDB
from app.infrastructure.database.models import UniquenessQuotient, User
from eth_utils import to_checksum_address
from sqlalchemy import Numeric, cast, exists, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.sql.functions import coalesce
from v2.allocations.schemas import (
    AllocationWithUserUQScore,
    ProjectAllocationV1,
    ProjectDonationV1,
    UserAllocationRequest,
)
from v2.core.types import Address
from v2.users.repositories import get_user_by_address


async def sum_allocations_by_epoch(session: AsyncSession, epoch_number: int) -> int:
    """Get the sum of all allocations for a given epoch. We only consider the allocations that have not been deleted."""

    result = await session.execute(
        select(coalesce(func.sum(cast(Allocation.amount, Numeric)), 0))
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
    )
    count = result.scalar()

    if count is None:
        return 0

    return int(count)


async def get_allocations_with_user_uqs(
    session: AsyncSession, epoch_number: int
) -> list[AllocationWithUserUQScore]:
    """Get all allocations for a given epoch, including the uniqueness quotients of the users."""

    result = await session.execute(
        select(
            Allocation.project_address,
            Allocation.amount,
            User.address.label("user_address"),
            UniquenessQuotient.score,
        )
        .join(User, Allocation.user_id == User.id)
        .join(UniquenessQuotient, UniquenessQuotient.user_id == User.id)
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
        .filter(UniquenessQuotient.epoch == epoch_number)
    )

    rows = result.all()

    return [
        AllocationWithUserUQScore(
            project_address=project_address,
            amount=amount,
            user_address=user_address,
            user_uq_score=Decimal(uq_score),
        )
        for project_address, amount, user_address, uq_score in rows
    ]


async def soft_delete_user_allocations_by_epoch(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
) -> None:
    """Soft delete all user allocations for a given epoch."""

    # Find all the allocations for the user and epoch that have not been deleted
    user = await get_user_by_address(session, user_address)

    if user is None:
        return None

    now = datetime.utcnow()

    # Perform a batch update to soft delete the allocations
    await session.execute(
        update(Allocation)
        .where(
            Allocation.epoch == epoch_number,
            Allocation.user_id == user.id,
            Allocation.deleted_at.is_(None),
        )
        .values(deleted_at=now)
    )


async def store_allocation_request(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
    request: UserAllocationRequest,
    leverage: float,
) -> None:
    """Store an allocation request in the database."""

    user = await get_user_by_address(session, user_address)
    if user is None:
        return None

    new_allocations = [
        Allocation(
            epoch=epoch_number,
            user_id=user.id,
            nonce=request.nonce,
            project_address=to_checksum_address(a.project_address),
            amount=str(a.amount),
        )
        for a in request.allocations
    ]

    allocation_request = AllocationRequestDB(
        user_id=user.id,
        epoch=epoch_number,
        nonce=request.nonce,
        signature=request.signature,
        is_manually_edited=request.is_manually_edited,
        leverage=leverage,
    )

    session.add(allocation_request)
    session.add_all(new_allocations)


async def get_last_allocation_request_nonce(
    session: AsyncSession,
    user_address: Address,
) -> int | None:
    """Get the last nonce of the allocation requests for a user."""

    user = await get_user_by_address(session, user_address)
    if user is None:
        return None

    result = await session.scalar(
        select(func.max(AllocationRequestDB.nonce)).filter(
            AllocationRequestDB.user_id == user.id
        )
    )

    if result is None:
        return None

    return result


async def get_all_allocations_for_epoch(
    session: AsyncSession,
    epoch_number: int,
    include_zero_allocations: bool = False,
) -> list[ProjectDonationV1]:
    """Get all allocations for a given epoch."""

    query = (
        select(Allocation)
        .options(joinedload(Allocation.user))
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
    )

    if not include_zero_allocations:
        query = query.filter(Allocation.amount != "0")

    results = await session.scalars(query)

    return [
        ProjectDonationV1(
            amount=a.amount,
            donor_address=a.user.address,
            project_address=a.project_address,
        )
        for a in results
    ]


async def get_donors_for_epoch(
    session: AsyncSession,
    epoch_number: int,
) -> list[Address]:
    """Get all donors for a given epoch."""

    results = await session.scalars(
        select(User.address)
        .join(Allocation, Allocation.user_id == User.id)
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
        .distinct()
    )

    return TypeAdapter(list[Address]).validate_python(results.all())


async def get_donations_by_project(
    session: AsyncSession,
    project_address: str,
    epoch_number: int,
) -> list[ProjectAllocationV1]:
    """Get all donations for a project in a given epoch."""

    results = await session.scalars(
        select(Allocation)
        .options(joinedload(Allocation.user))
        .filter(Allocation.project_address == project_address)
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
    )

    return [
        ProjectAllocationV1(
            address=a.user.address,
            amount=a.amount,
        )
        for a in results
    ]


async def get_allocations_by_user(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
) -> list[ProjectAllocationV1]:
    """Get all allocations for a user in a given epoch."""

    results = await session.scalars(
        select(Allocation)
        .join(User, Allocation.user_id == User.id)
        .filter(
            Allocation.epoch == epoch_number,
            Allocation.deleted_at.is_(None),
            User.address == user_address,
        )
    )

    return [
        ProjectAllocationV1(
            address=a.project_address,
            amount=a.amount,
        )
        for a in results
    ]


async def get_last_allocation_request(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
) -> AllocationRequestDB | None:
    """Get the last allocation request for a user in a given epoch."""

    user = await get_user_by_address(session, user_address)
    if user is None:
        return None

    return await session.scalar(
        select(AllocationRequestDB)
        .filter(AllocationRequestDB.user_id == user.id)
        .filter(AllocationRequestDB.epoch == epoch_number)
        .order_by(AllocationRequestDB.nonce.desc())
    )


async def get_user_allocations_sum_by_epoch(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
) -> int:
    """Get the sum of all allocations for a user in a given epoch."""

    result = await session.scalar(
        select(func.sum(cast(Allocation.amount, Numeric)))
        .join(User, Allocation.user_id == User.id)
        .filter(
            Allocation.epoch == epoch_number,
            Allocation.deleted_at.is_(None),
            User.address == user_address,
        )
    )

    if result is None:
        return 0

    return int(result)


async def has_allocation_requests(
    session: AsyncSession,
    user_address: Address,
    epoch_number: int,
) -> bool:
    """Check if a user has allocation requests for a given epoch."""

    result = await session.scalar(
        select(
            exists().where(
                User.address == user_address,
                AllocationRequestDB.user_id == User.id,
                AllocationRequestDB.epoch == epoch_number,
            )
        )
    )
    return bool(result)


async def get_user_allocations_history(
    session: AsyncSession,
    user_address: Address,
    from_ts: int,
    limit: int,
) -> list[tuple[AllocationRequestDB, list[Allocation]]]:
    """
    Returns all allocation requests and allocation objects for a given user.
    From the 'from_ts' timestamp, max 'limit' elements backwards.
    """

    user = await get_user_by_address(session, user_address)
    if user is None:
        return []

    # Convert timestamp to datetime for comparison
    from_datetime = datetime.utcfromtimestamp(from_ts)

    # Get allocation requests ordered by creation time and nonce (descending)
    allocation_requests_result = await session.scalars(
        select(AllocationRequestDB)
        .filter(AllocationRequestDB.user_id == user.id)
        .filter(AllocationRequestDB.created_at <= from_datetime)
        .order_by(
            AllocationRequestDB.created_at.desc(), AllocationRequestDB.nonce.desc()
        )
        .limit(limit)
    )

    allocation_requests = list(allocation_requests_result.all())

    if not allocation_requests:
        return []

    # Get all allocations that belong to the allocation requests
    allocations_result = await session.scalars(
        select(Allocation)
        .filter(Allocation.user_id == user.id)
        .filter(
            Allocation.nonce.in_(
                [alloc_request.nonce for alloc_request in allocation_requests]
            )
        )
    )

    allocations = list(allocations_result.all())

    # Group allocations by nonce for easier connection to allocation request
    allocations_by_nonce = defaultdict(list)
    for alloc in allocations:
        allocations_by_nonce[alloc.nonce].append(alloc)

    return [
        (alloc_request, allocations_by_nonce[alloc_request.nonce])
        for alloc_request in allocation_requests
    ]
