from app.context.manager import state_context, epoch_context, Context
from app.modules.registry import get_services
from app.context.epoch_state import EpochState
from app.engine.projects.rewards import ProjectRewardsResult


def get_estimated_project_rewards() -> ProjectRewardsResult:
    context = state_context(EpochState.PENDING)
    service = get_services(context.epoch_state).project_rewards_service
    return service.get_project_rewards(context)


def get_allocation_threshold(epoch: int = None) -> int:
    context = _get_context(epoch)
    service = get_services(context.epoch_state).project_rewards_service
    return service.get_allocation_threshold(context)


def _get_context(epoch: int = None) -> Context:
    if epoch is not None:
        return epoch_context(epoch)
    return state_context(EpochState.PENDING)
