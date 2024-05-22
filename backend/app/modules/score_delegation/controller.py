from app.context.epoch_state import EpochState
from app.context.manager import state_context
from app.modules.modules_factory.current import CurrentServices
from app.modules.registry import get_services


def delegate_uq_score(payload):
    context = state_context(EpochState.CURRENT)
    services: CurrentServices = get_services(EpochState.CURRENT)
    return services.score_delegation_service.delegate(context, payload)
