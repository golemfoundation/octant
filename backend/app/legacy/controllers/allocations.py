from typing_extensions import deprecated
from typing import Optional

from app.modules.user.allocations import controller as new_controller
from app.legacy.core.allocations import (
    AllocationRequest,
)


@deprecated("ALLOCATIONS REWORK")
def allocate(
    request: AllocationRequest, is_manually_edited: Optional[bool] = None
) -> str:
    return new_controller.allocate(request, is_manually_edited=is_manually_edited)
