import { ExtendedProposal } from 'types/proposals';

export default interface AllocationItemProps extends ExtendedProposal {
  className?: string;
  isSelected: boolean;
  onChange: (id: number, value: string) => void;
  onSelectItem: (id: number) => void;
  percentage?: number;
  totalValueOfAllocations?: string;
  value?: string;
}
