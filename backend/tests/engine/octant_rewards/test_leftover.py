from app.engine.octant_rewards.leftover.with_ppf import LeftoverWithPPF
from app.engine.octant_rewards.leftover import LeftoverPayload
from app.engine.octant_rewards.leftover.default import PreliminaryLeftover


def test_default_leftover():
    payload = LeftoverPayload(
        staking_proceeds=1000,
        operational_cost=250,
        community_fund=None,
        ppf=None,
        total_withdrawals=430,
    )
    uut = PreliminaryLeftover()

    result = uut.calculate_leftover(payload)

    assert result == 320


def test_leftover_with_ppf():
    payload = LeftoverPayload(
        staking_proceeds=1000,
        operational_cost=250,
        community_fund=50,
        ppf=350,
        total_withdrawals=430,
        total_matched_rewards=100,
        used_matched_rewards=95,
    )
    uut = LeftoverWithPPF()

    result = uut.calculate_leftover(payload)

    assert result == 95
