from app.v2.modules.staking.proceeds.service.service import get_staking_proceeds_service
from app.v2.modules.staking.proceeds.service.service import (
    CurrentStakingProceedsService,
)


def test_get_service_with_CurrentEpochContext(self):
    context = CurrentEpochContext()
    result = get_staking_proceeds_service(context)
    self.assertIsInstance(result, CurrentStakingProceedsService)
