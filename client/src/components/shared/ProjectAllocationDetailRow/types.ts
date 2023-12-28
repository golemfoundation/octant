import { BigNumber } from 'ethers';

export default interface ProjectAllocationDetailRowProps {
  address: string;
  amount: BigNumber;
  epoch?: number;
}
