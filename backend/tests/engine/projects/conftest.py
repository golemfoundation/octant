from decimal import Decimal

import pytest

from app.engine.projects.rewards.allocations import (
    AllocationItem,
)
from app.engine.projects.rewards.funding_cap.percent import ProjectMatchedRewardsDTO
from app.modules.dto import AllocationDTO
from tests.helpers.constants import MAX_UQ_SCORE, LOW_UQ_SCORE


@pytest.fixture
def data_for_qf_max_uq_score(projects):
    """
    This fixture is used to create a list of allocations for the quadratic funding algorithm.

    Project_A_IR_Donations	Project_A_IR_Donations_SQRT	Project_B_IR_Donations	Project_B_IR_Donations_SQRT	Project_C_IR_Donations	Project_C_IR_Donations_SQRT	Matched_Funding
    100     	            10          	            5       	            2.236067977 	            50      	            7.071067812     	        35000
    200	                    14.14213562	                10	                    3.16227766	                100	                    10
    300	                    17.32050808	                15	                    3.872983346	                200	                    14.14213562
    400	                    20	                        20	                    4.472135955	                0	                    0
    500	                    22.36067977	                25	                    5	                        0	                    0
    0	                    0	                        30	                    5.477225575	                0	                    0
    0	                    0	                        35	                    5.916079783	                0	                    0
    0	                    0	                        40	                    6.32455532	                0	                    0
    0	                    0	                        45	                    6.708203932	                0	                    0
    0	                    0	                        50	                    7.071067812	                0	                    0
    0	                    0	                        55	                    7.416198487	                0	                    0
    0	                    0	                        60	                    7.745966692	                0	                    0
    0	                    0	                        65	                    8.062257748	                0	                    0
    0	                    0	                        70	                    8.366600265	                0	                    0
    0	                    0	                        75	                    8.660254038	                0	                    0
    0	                    0	                        80	                    8.94427191	                0	                    0
    0	                    0	                        85	                    9.219544457	                0	                    0
    0	                    0	                        90	                    9.486832981	                0	                    0
    0	                    0	                        95	                    9.746794345	                0	                    0

    IR_SUM
        A_IR: 1500
        B_IR: 950
        C_IR: 350

    SUM_of_SQRTs
        A_IR: 83.82332347
        B_IR: 127.8893183
        C_IR: 31.21320344

    QV
        A_IR: 7026.349558
        B_IR: 16355.67773
        C_IR: 974.2640687

    MF_PRCNT
        A_IR: 0.2884819144
        B_IR: 0.6715175759
        C_IR: 0.0400005097

    MF_DISTRIBUTION
        A_IR: 10096.867
        B_IR: 23503.11516
        C_IR: 1400.017839

    TOTAL_DONATIONS
        A_IR: 11596.867
        B_IR: 24453.11516
        C_IR: 1750.017839

    Formulas:
    QF = SUM_of_SQRTs ** 2
    MF_PRCNT = QV / IRs_SUMs
    MF_DISTRIBUTION = MF_PRCNT * MATCHED_FUNDING
    TOTAL_DONATIONS = MF_DISTRIBUTION + IR_SUM
    """

    allocations = [
        *[
            AllocationDTO(projects[0], amount, uq_score=Decimal(1))
            for amount in range(100, 600, 100)
        ],
        *[
            AllocationDTO(projects[1], amount, uq_score=Decimal(1))
            for amount in range(5, 100, 5)
        ],
        AllocationDTO(projects[2], 50, uq_score=Decimal(1)),
        AllocationDTO(projects[2], 100, uq_score=Decimal(1)),
        AllocationDTO(projects[2], 200, uq_score=Decimal(1)),
    ]

    matched_rewards = 35000

    return allocations, matched_rewards


@pytest.fixture
def dataset_1_for_capped_qf_max_uq_score(projects):
    return _prepare_dataset1_for_capped_qf(projects, Decimal(MAX_UQ_SCORE))


@pytest.fixture
def dataset_1_for_capped_qf_lower_uq_score(projects):
    return _prepare_dataset1_for_capped_qf(projects, Decimal(LOW_UQ_SCORE))


@pytest.fixture
def dataset_2_for_capped_qf_max_uq_score(projects):
    return _prepare_dataset2_for_capped_qf(projects, Decimal(MAX_UQ_SCORE))


@pytest.fixture
def dataset_2_for_capped_qf_lower_uq_score(projects):
    return _prepare_dataset2_for_capped_qf(projects, Decimal(LOW_UQ_SCORE))


@pytest.fixture
def many_allocations_per_project_for_capped_quadratic_funding(projects):
    matched_rewards = 100000
    allocations = [
        AllocationItem(projects[0], 1000, uq_score=Decimal(1)),
        AllocationItem(projects[0], 1000, uq_score=Decimal(1)),
        AllocationItem(projects[1], 2000, uq_score=Decimal(1)),
        AllocationItem(projects[1], 2000, uq_score=Decimal(1)),
        AllocationItem(projects[2], 3000, uq_score=Decimal(1)),
        AllocationItem(projects[2], 3000, uq_score=Decimal(1)),
        AllocationItem(projects[3], 4000, uq_score=Decimal(1)),
        AllocationItem(projects[3], 4000, uq_score=Decimal(1)),
        AllocationItem(projects[4], 5000, uq_score=Decimal(1)),
        AllocationItem(projects[4], 5000, uq_score=Decimal(1)),
        AllocationItem(projects[5], 6000, uq_score=Decimal(1)),
        AllocationItem(projects[5], 6000, uq_score=Decimal(1)),
    ]

    return matched_rewards, allocations


@pytest.fixture
def matched_rewards_with_capped_distribution(projects):
    matched_rewards = 10000
    computed_matched_rewards = [
        ProjectMatchedRewardsDTO(projects[0], Decimal("500.0")),
        ProjectMatchedRewardsDTO(projects[1], Decimal("2000.0")),
        ProjectMatchedRewardsDTO(projects[2], Decimal("2000.0")),
        ProjectMatchedRewardsDTO(projects[3], Decimal("2500.0")),
        ProjectMatchedRewardsDTO(projects[4], Decimal("2500.0")),
        ProjectMatchedRewardsDTO(projects[5], Decimal("500.0")),
    ]
    expected_distribution = {
        projects[0]: Decimal("1000.0"),
        projects[1]: Decimal("2000.0"),
        projects[2]: Decimal("2000.0"),
        projects[3]: Decimal("2000.0"),
        projects[4]: Decimal("2000.0"),
        projects[5]: Decimal("1000.0"),
    }

    return matched_rewards, computed_matched_rewards, expected_distribution


@pytest.fixture
def matched_rewards_with_no_capped_distribution(projects):
    matched_rewards = 10000
    computed_matched_rewards = [
        ProjectMatchedRewardsDTO(projects[0], Decimal(2000)),
        ProjectMatchedRewardsDTO(projects[1], Decimal(2000)),
        ProjectMatchedRewardsDTO(projects[2], Decimal(2000)),
        ProjectMatchedRewardsDTO(projects[3], Decimal(2000)),
        ProjectMatchedRewardsDTO(projects[4], Decimal(2000)),
    ]
    expected_distribution = dict(
        map(lambda x: (x.project_address, x.amount), computed_matched_rewards)
    )

    return matched_rewards, computed_matched_rewards, expected_distribution


def _prepare_dataset1_for_capped_qf(projects: list, uq_score: Decimal):
    matched_rewards = 35000
    allocations = [
        AllocationItem(projects[0], 1000, uq_score=uq_score),
        AllocationItem(projects[1], 2000, uq_score=uq_score),
        AllocationItem(projects[2], 3000, uq_score=uq_score),
        AllocationItem(projects[3], 4000, uq_score=uq_score),
        AllocationItem(projects[4], 5000, uq_score=uq_score),
        AllocationItem(projects[5], 6000, uq_score=uq_score),
        AllocationItem(projects[6], 7000, uq_score=uq_score),
        AllocationItem(projects[7], 8000, uq_score=uq_score),
        AllocationItem(projects[8], 9000, uq_score=uq_score),
        AllocationItem(projects[9], 10000, uq_score=uq_score),
    ]

    return matched_rewards, allocations


def _prepare_dataset2_for_capped_qf(projects: list, uq_score: Decimal):
    matched_rewards = 35000
    allocations = [
        AllocationItem(projects[0], 1000, uq_score=uq_score),
        AllocationItem(projects[1], 2000, uq_score=uq_score),
        AllocationItem(projects[2], 3000, uq_score=uq_score),
        AllocationItem(projects[3], 4000, uq_score=uq_score),
        AllocationItem(projects[4], 5000, uq_score=uq_score),
        AllocationItem(projects[5], 6000, uq_score=uq_score),
    ]

    return matched_rewards, allocations
