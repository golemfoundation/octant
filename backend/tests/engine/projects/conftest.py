import pytest

from app.modules.dto import AllocationDTO


@pytest.fixture
def data_for_quadratic_funding(projects):
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

    IR_SUM	                1500		                950		                                            350
    SUM_of_SQRTs	        83.82332347		            127.8893183		                                    31.21320344
    QV	                    7026.349558		            16355.67773		                                    974.2640687
    MF_PRCNT	            0.2884819144		        0.6715175759		                                0.0400005097
    MF_DISTRIBUTION	        10096.867		            23503.11516		                                    1400.017839
    TOTAL_DONATIONS	        11596.867		            24453.11516		                                    1750.017839

    QF = SUM_of_SQRTs ** 2
    MF_PRCNT = QV / IRs_SUMs
    MF_DISTRIBUTION = MF_PRCNT * MATCHED_FUNDING
    TOTAL_DONATIONS = MF_DISTRIBUTION + IR_SUM
    """

    allocations = [
        *[AllocationDTO(projects[0], amount) for amount in range(100, 600, 100)],
        *[AllocationDTO(projects[1], amount) for amount in range(5, 100, 5)],
        AllocationDTO(projects[2], 50),
        AllocationDTO(projects[2], 100),
        AllocationDTO(projects[2], 200),
    ]

    matched_rewards = 35000

    return allocations, matched_rewards
