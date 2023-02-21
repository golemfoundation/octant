import { ExtendedProposal } from 'types/proposals';

export default interface AllocationItemProps extends ExtendedProposal {
  className?: string;
  isSelected: boolean;
  onChange: (proposalAddress: string, value: string) => void;
  onSelectItem: (proposalAddress: string) => void;
  percentage?: number;
  totalValueOfAllocations?: string;
  value?: string;
}
