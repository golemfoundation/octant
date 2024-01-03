from app.context.manager import epoch_context
from app.modules.octant_rewards.service.service import OctantRewards
from app.modules.registry import get_services


def get_octant_rewards(epoch_num: int) -> OctantRewards:
    context = epoch_context(epoch_num, with_rewards=False)
    service = get_services(context.epoch_state).octant_rewards_service
    return service.get_octant_rewards(context)
