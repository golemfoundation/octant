from fastapi import APIRouter

from .dependencies import GetAllocator
from .schemas import UserAllocationRequest, UserAllocationRequestV1

api = APIRouter(prefix="/allocations", tags=["Allocations"])


@api.post("/allocate", status_code=201)
async def allocate(
    # Component dependencies
    allocator: GetAllocator,
    # Request Parameters
    allocation_request: UserAllocationRequestV1,
) -> None:
    """
    Request an allocation for the user.
    Only available during the allocation window.
    """

    import time

    start = time.time()

    # TODO: We should ideally move to the newer version of the schema as it's simpler
    request = UserAllocationRequest(
        user_address=allocation_request.user_address,
        allocations=allocation_request.payload.allocations,
        nonce=allocation_request.payload.nonce,
        signature=allocation_request.signature,
        is_manually_edited=allocation_request.is_manually_edited,
    )

    await allocator.handle(request)

    print("Allocation took: ", time.time() - start)
