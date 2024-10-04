from fastapi import APIRouter

from v2.epochs.dependencies import GetEpochsContracts

from .dependencies import GetAllocations
from .schemas import UserAllocationRequest, UserAllocationRequestV1

api = APIRouter(prefix="/allocations", tags=["allocations"])


@api.post("/allocate", status_code=201)
async def allocate(
    # Component dependencies
    epochs_contracts: GetEpochsContracts,
    allocations: GetAllocations,
    # Arguments
    allocation_request: UserAllocationRequestV1,
) -> None:
    """
    Make an allocation for the user.
    """

    import time


    start = time.time()
    request = UserAllocationRequest(
        user_address=allocation_request.user_address,
        allocations=allocation_request.payload.allocations,
        nonce=allocation_request.payload.nonce,
        signature=allocation_request.signature,
        is_manually_edited=allocation_request.is_manually_edited,
    )

    print("allocation_request", allocation_request)
    current_epoch = await epochs_contracts.get_current_epoch()
    print("current_epoch", current_epoch)
    # get pending epoch
    pending_epoch = await epochs_contracts.get_pending_epoch()
    print("pending_epoch", pending_epoch)

    await allocations.make(pending_epoch, request)

    print("allocate took: ", time.time() - start)
    
