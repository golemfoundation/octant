from datetime import datetime
from decimal import Decimal

from app.infrastructure.database.models import Allocation
from app.infrastructure.database.models import AllocationRequest as AllocationRequestDB
from app.infrastructure.database.models import UniquenessQuotient, User
from eth_utils import to_checksum_address
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy.sql.functions import coalesce
from v2.users.repositories import get_user_by_address

from .models import AllocationWithUserUQScore, ProjectDonation, UserAllocationRequest


async def sum_allocations_by_epoch(session: AsyncSession, epoch_number: int) -> int:
    """Get the sum of all allocations for a given epoch. We only consider the allocations that have not been deleted."""

    result = await session.execute(
        select(coalesce(func.sum(Allocation.amount), 0))
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
    )
    count = result.scalar()

    if count is None:
        return 0

    return count


async def get_allocations_with_user_uqs(
    session: AsyncSession, epoch_number: int
) -> list[AllocationWithUserUQScore]:
    """Get all allocations for a given epoch, including the uniqueness quotients of the users."""

    # result = await session.execute(
    #     select(Allocation)
    #     .filter(Allocation.epoch == epoch)
    #     .filter(Allocation.deleted_at.is_(None))
    #     .options(joinedload(Allocation.user).joinedload(User.uniqueness_quotients))
    # )
    # allocations = result.scalars().all()

    # return [
    #     AllocationWithUserUQScore(
    #         project_address=a.project_address,
    #         amount=int(a.amount),
    #         user_address=a.user.address,
    #         user_uq_score=next(
    #             (
    #                 uq.validated_score
    #                 for uq in a.user.uniqueness_quotients
    #                 if uq.epoch == epoch
    #             ),
    #             None,
    #         ),
    #     )
    #     for a in allocations
    # ]

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

    # result = await session.execute(
    #     select(
    #         Allocation.id.label('allocation_id'),
    #         Allocation.amount.label('allocation_amount'),
    #         User.id.label('user_id'),
    #         User.name.label('user_name'),
    #         UniquenessQuotient.id.label('uq_id'),
    #         UniquenessQuotient.score.label('uq_score')
    #     )
    #     .join(User, Allocation.user_id == User.id)
    #     .join(UniquenessQuotient, UniquenessQuotient.user_id == User.id)
    #     .filter(Allocation.epoch == epoch_number)
    #     .filter(Allocation.deleted_at.is_(None))
    #     .filter(UniquenessQuotient.epoch == epoch_number)
    # )

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


# allocations = database.allocations.get_all_with_uqs(
#     context.epoch_details.epoch_num
# )

# def get_all_allocations_with_uqs(epoch: int) -> List[AllocationDTO]:
#     allocations = (
#         Allocation.query.filter_by(epoch=epoch)
#         .filter(Allocation.deleted_at.is_(None))
#         .options(joinedload(Allocation.user).joinedload(User.uniqueness_quotients))
#         .all()
#     )

#     return [
#         AllocationDTO(
#             amount=int(a.amount),
#             project_address=a.project_address,
#             user_address=a.user.address,
#             uq_score=next(
#                 (
#                     uq.validated_score
#                     for uq in a.user.uniqueness_quotients
#                     if uq.epoch == epoch
#                 ),
#                 None,
#             ),
#         )
#         for a in allocations
#     ]


async def soft_delete_user_allocations_by_epoch(
    session: AsyncSession,
    user_address: str,
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
    user_address: str,
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
    user_address: str,
) -> int | None:
    """Get the last nonce of the allocation requests for a user."""

    user = await get_user_by_address(session, user_address)
    if user is None:
        return None

    result = await session.execute(
        select(func.max(AllocationRequestDB.nonce)).filter(
            AllocationRequestDB.user_id == user.id
        )
    )

    return result.scalar()


async def get_donations_by_project(
    session: AsyncSession,
    project_address: str,
    epoch_number: int,
) -> list[ProjectDonation]:
    result = await session.execute(
        select(Allocation)
        .filter(Allocation.project_address == project_address)
        .filter(Allocation.epoch == epoch_number)
        .filter(Allocation.deleted_at.is_(None))
        .options(joinedload(Allocation.user))
    )

    allocations = result.all()

    return [
        ProjectDonation(
            amount=int(a.amount),
            donor_address=a.user.address,
            project_address=a.project_address,
        )
        for a in allocations
    ]

    # query: Query = Allocation.query.filter_by(
    #     project_address=to_checksum_address(project_address), epoch=epoch
    # ).options(joinedload(Allocation.user))

    # if not with_deleted:
    #     query = query.filter(Allocation.deleted_at.is_(None))

    # return query.all()

    # def get_allocations_by_project(
    #     self, context: Context, project_address: str
    # ) -> List[ProjectDonationDTO]:
    #     allocations = database.allocations.get_all_by_project_addr_and_epoch(
    #         project_address, context.epoch_details.epoch_num
    #     )

    #     return [
    #         ProjectDonationDTO(
    #             donor=a.user.address, amount=int(a.amount), project=project_address
    #         )
    #         for a in allocations
    #         if int(a.amount) != 0
    #     ]
