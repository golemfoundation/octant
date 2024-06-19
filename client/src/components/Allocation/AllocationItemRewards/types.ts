import AllocationItemProps from 'components/Allocation/AllocationItem/types';
import { ProjectDonor } from 'hooks/queries/donors/types';

export interface AllocationItemRewardsDonorsProps {
  isLoadingAllocateSimulate: boolean;
  isNewSimulatedPositive: boolean;
  isSimulateVisible: boolean;
  isSimulatedMatchedAvailable: boolean;
  projectDonors?: ProjectDonor[];
}

export default interface AllocationItemRewardsProps {
  address: string;
  isLoadingAllocateSimulate: AllocationItemProps['rewardsProps']['isLoadingAllocateSimulate'];
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  totalValueOfAllocations?: bigint;
  value: string;
}
