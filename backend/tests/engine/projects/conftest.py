from decimal import Decimal

import pytest

from app.modules.dto import AllocationDTO
from tests.helpers.constants import MR_FUNDING_CAP_PERCENT


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
        *[AllocationDTO(projects[0], amount) for amount in range(100, 600, 100)],
        *[AllocationDTO(projects[1], amount) for amount in range(5, 100, 5)],
        AllocationDTO(projects[2], 50),
        AllocationDTO(projects[2], 100),
        AllocationDTO(projects[2], 200),
    ]

    matched_rewards = 35000

    return allocations, matched_rewards


@pytest.fixture
def data_for_capped_quadratic_funding(projects):
    matched_rewards = 35000
    capped_allocations = (7000, 8000, 9000, 10000)
    capped_matched_rewards = Decimal(matched_rewards * MR_FUNDING_CAP_PERCENT)
    quadratic_allocations = [
        AllocationDTO(projects[0], 1000),
        AllocationDTO(projects[1], 2000),
        AllocationDTO(projects[2], 3000),
        AllocationDTO(projects[3], 4000),
        AllocationDTO(projects[4], 5000),
        AllocationDTO(projects[5], 6000),
        AllocationDTO(projects[6], capped_allocations[0]),
        AllocationDTO(projects[7], capped_allocations[1]),
        AllocationDTO(projects[8], capped_allocations[2]),
        AllocationDTO(projects[9], capped_allocations[3]),
    ]

    expected_distribution = {
        projects[0]: Decimal("1333.333333333333333333333334"),
        projects[1]: Decimal("2666.666666666666666666666666"),
        projects[2]: Decimal("4000.000000000000000000000000"),
        projects[3]: Decimal("5333.333333333333333333333333"),
        projects[4]: Decimal("6666.666666666666666666666667"),
        projects[5]: capped_matched_rewards,
        projects[6]: capped_matched_rewards,
        projects[7]: capped_matched_rewards,
        projects[8]: capped_matched_rewards,
        projects[9]: capped_matched_rewards,
    }

    print("EXPECTED", expected_distribution, flush=True)
    return matched_rewards, quadratic_allocations, expected_distribution


"""
proposal_name,Total Donations,Linear Distribution,Quadratic Distribution,Capped Quadratic Distribution
Boring Security,0.13372789407,0.0,1.0541830587189338,1.3868681146889585
DAO Drops,0.00802864141,0.0,0.2031370871304158,0.2672442387703745
Drips,0.10552616327,0.0,2.3646869977982363,3.1109483038470227
ETH Daily,0.00126420647,0.0,0.019691663968584527,0.02590607073157361
EthStaker,0.06345511217,0.0,0.9305053116279356,1.2241594441991186
Ethereum Attestation Service,0.09550561197,0.0,2.1943318756950476,2.8868315481613784
Ethereum Cat Herders,0.09468764077,0.0,1.596327885995425,2.100106074903405
Funding the Commons,0.10597121729,0.0,2.0867245009678634,2.7452648290984913
Gardens,0.00053357457,0.0,0.0054787498519564,0.0072077647380036705
Gitcoin,0.21092526641,0.0,3.6922036736641233,4.857410205552794
Giveth,0.8679455551399999,0.0,28.748319715346987,37.82087715633539
Glo Dollar,0.14704357877000002,0.0,1.8197945560182724,2.394095621393581
GrowThePie,70.40524872597,287.6218384235271,131.66859398362018,67.194
Hypercerts,1.80945852909,0.0,22.258512736597044,29.282980161242534
L2Beat,0.13959759157,0.0,4.8144444188136735,6.333814036538334
MetaGame,0.12737082157,0.0,0.8170571924915864,1.0749087255498955
MetaGov,0.00557026477,0.0,0.12484754961087677,0.16424764590960605
Nice Node,3.39962398406,13.88825574709425,8.470225969020843,11.143307818777423
Open Source Observer,0.27901364227000003,0.0,4.334486458744426,5.702388227039845
Pairwise,0.00758141197,0.0,0.2502687908160178,0.32925003225368377
Praise,0.00907198416,0.0,0.34071456562035607,0.44823919656154854
Protocol Guild,5.0457191015,20.612937677284556,37.66350823454919,49.54957132520948
ReFi DAO,0.01440194717,0.0,0.17830192842665243,0.23457146012475164
Revoke Cash,0.10084200002999999,0.0,4.620656750988173,6.078869759731494
Rotki,1.28842679806,0.0,19.489311197505685,25.639858327753316
Shielded Voting,3.38951743787,13.846968152094133,9.019486480738749,11.865907071401537
StateOfEth,0.00243229077,0.0,0.03128430232836943,0.04115717951513106
Tor Project,0.39088105367000003,0.0,12.687554256198728,16.691564435394362
Web3.js,2.12558978161,0.0,16.917380990198815,22.256263829418398
Web3.py,2.10912794377,0.0,17.56797911694692,23.112181395158636

"""
