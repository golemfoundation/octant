import { BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

interface GetCurrentEpochStateTextParams {
  suffix: string;
  value?: BigNumberish;
}

export default function getCurrentEpochStateText({
  value,
  suffix,
}: GetCurrentEpochStateTextParams): string {
  return `${formatUnits(value || 0)} ${suffix}`;
}
