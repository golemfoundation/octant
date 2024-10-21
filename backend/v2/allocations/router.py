from fastapi import APIRouter
from v2.allocations.dependencies import GetAllocator
from v2.allocations.schemas import UserAllocationRequest, UserAllocationRequestV1

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

    # TODO: We should ideally move to the newer version of the schema as it's simpler
    request = UserAllocationRequest(
        userAddress=allocation_request.user_address,
        allocations=allocation_request.payload.allocations,
        nonce=allocation_request.payload.nonce,
        signature=allocation_request.signature,
        isManuallyEdited=allocation_request.is_manually_edited,
    )

    await allocator.handle(request)
