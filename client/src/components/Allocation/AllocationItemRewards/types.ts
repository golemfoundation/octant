import AllocationItemProps from 'components/Allocation/AllocationItem/types';

export default interface AllocationItemRewardsProps {
  address: string;
  className?: string;
  isLoadingAllocateSimulate: AllocationItemProps['rewardsProps']['isLoadingAllocateSimulate'];
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  value: string;
}
