import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

export const toWei = (n: number): BigNumber => parseEther(Math.abs(n).toString());
