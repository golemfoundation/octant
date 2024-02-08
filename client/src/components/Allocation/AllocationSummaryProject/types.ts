import { BigNumber } from 'ethers';

import AllocationItemProps from 'components/Allocation/AllocationItem/types';

export default interface AllocationSummaryProjectProps {
  address: string;
  amount: BigNumber;
  isLoadingAllocateSimulate: boolean;
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  value: string;
}
