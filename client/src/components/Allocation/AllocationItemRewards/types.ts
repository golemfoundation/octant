import AllocationItemProps from 'components/Allocation/AllocationItem/types';
import { AllocateSimulate } from 'hooks/mutations/useAllocateSimulate';

export default interface AllocationItemRewardsProps {
  address: string;
  className?: string;
  isError: boolean;
  isLoadingAllocateSimulate: AllocationItemProps['rewardsProps']['isLoadingAllocateSimulate'];
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  simulatedThreshold?: AllocateSimulate['threshold'];
  value: string;
}
