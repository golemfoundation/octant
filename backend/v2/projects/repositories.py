from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.models import ProjectsDetails


async def get_projects_details_for_epoch(
    session: AsyncSession, epoch: int
) -> list[ProjectsDetails]:
    """Get project details for a specific epoch."""

    result = await session.scalars(
        select(ProjectsDetails).filter(ProjectsDetails.epoch == epoch)
    )
    return list(result.all())
