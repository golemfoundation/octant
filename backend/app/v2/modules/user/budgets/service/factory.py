from app.v2.context.context import (
    EpochContext,
    CurrentEpochContext,
    FutureEpochContext,
    PrePendingEpochContext,
    PendingEpochContext,
    FinalizedEpochContext,
    PreFinalizedEpochContext,
    Context,
)
from app.v2.modules.user.budgets.api import UserBudgetsService, UserBudgetsCalculator
from app.v2.modules.user.budgets.service.impl.current import CurrentUserBudgetsService
from app.v2.modules.user.budgets.service.impl.default import DefaultUserBudgetsService
from app.v2.modules.user.deposits.service.factory import get_user_deposits_service


def get_user_budgets_calculator(context: Context) -> UserBudgetsCalculator:
    current_user_budgets_service = get_user_budgets_service(
        context.current_epoch_context, "simulated"
    )
    future_user_budgets_service = get_user_budgets_service(
        context.future_epoch_context, "simulated"
    )

    return UserBudgetsCalculator(
        current_user_budgets_service, future_user_budgets_service
    )


def get_user_budgets_service(
    context: EpochContext, generator_type: str = "subgraph"
) -> UserBudgetsService:
    if isinstance(context, FutureEpochContext):
        pass
    elif isinstance(context, CurrentEpochContext):
        user_deposits_service = get_user_deposits_service(context, generator_type)
        return CurrentUserBudgetsService(user_deposits_service)
    elif isinstance(context, PrePendingEpochContext):
        pass
    elif isinstance(context, PendingEpochContext):
        pass
    elif isinstance(context, PreFinalizedEpochContext):
        pass
    elif isinstance(context, FinalizedEpochContext):
        pass
    elif isinstance(context, EpochContext):
        return DefaultUserBudgetsService()
    else:
        raise NotImplementedError
