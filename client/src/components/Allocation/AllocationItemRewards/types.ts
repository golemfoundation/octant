import AllocationItemProps from 'components/Allocation/AllocationItem/types';
import { ProjectDonor } from 'hooks/queries/donors/types';

export interface AllocationItemRewardsDonorsProps {
  isError: boolean;
  isLoadingAllocateSimulate: boolean;
  isSimulateVisible: boolean;
  isSimulatedMatchedAvailable: boolean;
  projectDonors?: ProjectDonor[];
  userAllocationToThisProject?: bigint;
  valueToUse: string;
}

export default interface AllocationItemRewardsProps {
  address: string;
  isError: boolean;
  isLoadingAllocateSimulate: AllocationItemProps['rewardsProps']['isLoadingAllocateSimulate'];
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  totalValueOfAllocations?: bigint;
  value: string;
}
