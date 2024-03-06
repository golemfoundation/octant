from typing import List, Tuple, Dict

from app.context.epoch_state import EpochState
from app.context.manager import epoch_context, state_context
from app.exceptions import NotImplementedForGivenEpochState
from app.modules.dto import AllocationDTO
from app.modules.registry import get_services
from app.modules.user.allocations.service.pending import PendingUserAllocations


def get_donors(epoch_num: int) -> List[str]:
    context = epoch_context(epoch_num)
    if context.epoch_state > EpochState.PENDING:
        raise NotImplementedForGivenEpochState()
    service = get_services(context.epoch_state).user_allocations_service
    return service.get_all_donors_addresses(context)


def simulate_allocation(
    payload: Dict, user_address: str
) -> Tuple[float, int, List[Dict[str, int]]]:
    context = state_context(EpochState.PENDING)
    service: PendingUserAllocations = get_services(
        context.epoch_state
    ).user_allocations_service
    user_allocations = _deserialize_payload(payload)
    leverage, threshold, projects_rewards = service.simulate_allocation(
        context, user_allocations, user_address
    )

    matched = [{"address": p.address, "value": p.matched} for p in projects_rewards]

    return leverage, threshold, matched


def _deserialize_payload(payload: Dict) -> List[AllocationDTO]:
    return [
        AllocationDTO.from_dict(allocation_data)
        for allocation_data in payload["allocations"]
    ]
