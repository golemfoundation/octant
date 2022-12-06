import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export function getCurrentEpochStateText(
  isConnected: boolean,
  depositsValue?: BigNumberish,
): string {
  if (!isConnected) {
    return 'Please connect your wallet first.';
  }
  if (!depositsValue) {
    return 'Fetching data about deposit value.';
  }
  return `${formatUnits(depositsValue)} GLM`;
}
