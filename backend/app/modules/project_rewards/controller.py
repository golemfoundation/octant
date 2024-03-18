from app.context.manager import state_context
from app.modules.registry import get_services
from app.context.epoch_state import EpochState
from app.engine.projects.rewards import ProjectRewardsResult


def get_estimated_project_rewards() -> ProjectRewardsResult:
    context = state_context(EpochState.PENDING)
    service = get_services(context.epoch_state).project_rewards_service
    return service.get_project_rewards(context)
