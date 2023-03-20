import { ProposalWithAllocations } from 'components/dedicated//ProposalItem/types';

export interface AllocationItemWithAllocations extends ProposalWithAllocations {
  isAllocatedTo: boolean;
  isSelected: boolean;
  value: string | undefined;
}

export default interface AllocationItemProps extends AllocationItemWithAllocations {
  className?: string;
  onChange: (proposalAddress: string, value: string) => void;
  onSelectItem: (proposalAddress: string) => void;
}
