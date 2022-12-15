import { BigNumber } from 'ethers';

export default interface AllocationItemProps {
  className?: string;
  eth?: number;
  id: BigNumber;
  isSelected: boolean;
  name: string;
  onChange: (id: number, value: number) => void;
  onSelectItem: (id: number) => void;
  percent?: number;
  value?: number;
}
