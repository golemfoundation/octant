import { BigNumber } from 'ethers';

export default interface ProposalDonorsListItemProps {
  amount: BigNumber;
  className?: string;
  donorAddress: string;
}
