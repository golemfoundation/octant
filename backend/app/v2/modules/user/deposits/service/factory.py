from app.v2.context.context import (
    EpochContext,
    CurrentEpochContext,
    FutureEpochContext,
    PrePendingEpochContext,
    PendingEpochContext,
    FinalizedEpochContext,
    PreFinalizedEpochContext,
)
from app.v2.modules.user.deposits.api import UserDepositsService
from app.v2.modules.user.deposits.service.calculator import UserDepositsCalculator

from app.v2.modules.user.deposits.service.events_generator.simulated import (
    SimulatedEventsGenerator,
)
from app.v2.modules.user.deposits.service.events_generator.subgraph import (
    SubgraphEventsGenerator,
)
from app.v2.modules.user.deposits.service.impl.current import CurrentUserDepositsService
from app.v2.modules.user.deposits.service.impl.default import DefaultUserDepositsService
from app.v2.modules.user.deposits.service.impl.future import FutureUserDepositsService
from app.v2.modules.user.deposits.service.impl.pre_pending import (
    PrePendingUserDepositsService,
)


def get_user_deposits_calculator(
    context: EpochContext, generator_type: str = "subgraph"
) -> UserDepositsCalculator:
    generator = (
        SimulatedEventsGenerator
        if generator_type == "simulated"
        else SubgraphEventsGenerator
    )
    start = context.epoch_details.start_sec
    end = context.epoch_details.end_sec
    event_generator = generator(epoch_start=start, epoch_end=end)

    return UserDepositsCalculator(event_generator)


def get_user_deposits_service(
    context: EpochContext, generator_type: str = "subgraph"
) -> UserDepositsService:
    user_deposits_calculator = get_user_deposits_calculator(context, generator_type)

    if isinstance(context, FutureEpochContext):
        return FutureUserDepositsService(
            user_deposits_calculator=user_deposits_calculator,
        )
    elif isinstance(context, CurrentEpochContext):
        return CurrentUserDepositsService(
            user_deposits_calculator=user_deposits_calculator,
        )
    elif isinstance(context, PrePendingEpochContext):
        return PrePendingUserDepositsService(
            user_deposits_calculator=user_deposits_calculator,
        )
    elif isinstance(context, PendingEpochContext):
        pass
    elif isinstance(context, PreFinalizedEpochContext):
        pass
    elif isinstance(context, FinalizedEpochContext):
        pass
    elif isinstance(context, EpochContext):
        return DefaultUserDepositsService()
    else:
        raise NotImplementedError
