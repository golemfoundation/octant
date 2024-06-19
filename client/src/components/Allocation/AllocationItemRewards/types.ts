import AllocationItemProps from 'components/Allocation/AllocationItem/types';

export default interface AllocationItemRewardsProps {
  address: string;
  isLoadingAllocateSimulate: AllocationItemProps['rewardsProps']['isLoadingAllocateSimulate'];
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  totalValueOfAllocations?: bigint;
  value: string;
}
