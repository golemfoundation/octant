import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

interface GetCurrentEpochStateTextParams {
  isConnected: boolean;
  suffix: string;
  value?: BigNumberish;
}

export function getCurrentEpochStateText({
  isConnected,
  value,
  suffix,
}: GetCurrentEpochStateTextParams): string {
  if (!isConnected) {
    return 'Please connect your wallet first.';
  }
  if (value === undefined) {
    return 'Fetching data...';
  }
  return `${formatUnits(value)} ${suffix}`;
}
