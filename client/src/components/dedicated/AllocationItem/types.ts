import { ProposalWithRewards } from 'hooks/queries/useProposalsWithRewards';

export interface AllocationItemWithAllocations extends ProposalWithRewards {
  isAllocatedTo: boolean;
  isSelected: boolean;
  value: string | undefined;
}

export default interface AllocationItemProps extends AllocationItemWithAllocations {
  className?: string;
  onChange: (proposalAddress: string, value: string) => void;
  onSelectItem: (proposalAddress: string) => void;
}
