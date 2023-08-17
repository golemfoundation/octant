import { BigNumber } from 'ethers';

export default interface DonorsItemProps {
  amount: BigNumber;
  className?: string;
  donorAddress: string;
}
