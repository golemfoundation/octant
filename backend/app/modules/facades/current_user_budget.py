from app.modules.octant_rewards import controller as octant_rewards_controller
from app.modules.snapshots.pending import controller as pending_snapshot_controller
from app.modules.user.budgets import controller as budgets_controller


def get_current_user_budget(user_address: str) -> int:
    estimated_eth_proceeds = (
        octant_rewards_controller.get_current_octant_rewards().staking_proceeds
    )
    simulated_snapshot = (
        pending_snapshot_controller.simulate_pending_epoch_snapshot_with_estimated_eth(
            estimated_eth_proceeds=estimated_eth_proceeds
        )
    )

    print("DEBUG", simulated_snapshot.user_budgets, flush=True)

    current_budget = budgets_controller.get_current_budget(
        user_address, simulated_snapshot.user_budgets
    )

    return current_budget
