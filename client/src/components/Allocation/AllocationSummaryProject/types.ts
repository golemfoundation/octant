import AllocationItemProps from 'components/Allocation/AllocationItem/types';

export default interface AllocationSummaryProjectProps {
  address: string;
  amount: bigint;
  isLoadingAllocateSimulate: boolean;
  simulatedMatched?: AllocationItemProps['rewardsProps']['simulatedMatched'];
  value: string;
}
