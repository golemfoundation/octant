import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import getFormattedUnits from './getFormattedUnit';

const testCases = [
  { argument: BigNumber.from(0), expectedValue: '0 ETH' },
  { argument: BigNumber.from(10).pow(0), expectedValue: '1 WEI' },
  { argument: BigNumber.from(10).pow(1), expectedValue: '10 WEI' },
  { argument: BigNumber.from(10).pow(2), expectedValue: '100 WEI' },
  { argument: BigNumber.from(10).pow(3), expectedValue: '1000 WEI' },
  { argument: BigNumber.from(10).pow(4), expectedValue: '10000 WEI' },
  { argument: BigNumber.from(10).pow(5), expectedValue: '0.0001 GWEI' },
  { argument: BigNumber.from(10).pow(6), expectedValue: '0.001 GWEI' },
  { argument: BigNumber.from(10).pow(7), expectedValue: '0.01 GWEI' },
  { argument: BigNumber.from(10).pow(8), expectedValue: '0.1 GWEI' },
  { argument: BigNumber.from(10).pow(9), expectedValue: '1 GWEI' },
  { argument: BigNumber.from(10).pow(10), expectedValue: '10 GWEI' },
  { argument: BigNumber.from(10).pow(11), expectedValue: '100 GWEI' },
  { argument: BigNumber.from(10).pow(12), expectedValue: '1000 GWEI' },
  { argument: BigNumber.from(10).pow(13), expectedValue: '10000 GWEI' },
  { argument: BigNumber.from(10).pow(14), expectedValue: '0.0001 ETH' },
  { argument: BigNumber.from(10).pow(15), expectedValue: '0.001 ETH' },
  { argument: BigNumber.from(10).pow(16), expectedValue: '0.01 ETH' },
  { argument: BigNumber.from(10).pow(17), expectedValue: '0.1 ETH' },
  { argument: BigNumber.from(10).pow(18), expectedValue: '1 ETH' },
  { argument: BigNumber.from(10).pow(19), expectedValue: '10 ETH' },
  { argument: BigNumber.from(10).pow(20), expectedValue: '100 ETH' },
  { argument: BigNumber.from(10).pow(21), expectedValue: '1000 ETH' },
  { argument: BigNumber.from(10).pow(22), expectedValue: '10000 ETH' },
];

describe('getFormattedUnits', () => {
  for (const { argument, expectedValue } of testCases) {
    it(`returns ${expectedValue} for an argument ${formatUnits(argument)}`, () => {
      expect(getFormattedUnits(argument)).toBe(expectedValue);
    });
  }
});
