import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import getFormattedGlmValue from './getFormattedGlmValue';

const testCases = [
  { argument: BigNumber.from(0), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(0), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(1).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(2).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(2), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(3).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(3), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(4).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(4), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(5).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(5), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(6).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(6), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(7).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(7), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(8).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(8), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(9).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(9), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(10).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(10), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(11).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(11), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(12).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(12), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(13).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(13), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(14).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(14), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(15).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(15), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(16).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(16), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(17).sub(1), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(17), expectedValue: '0 GLM' },
  { argument: BigNumber.from(10).pow(18).sub(1), expectedValue: '1 GLM' },
  { argument: BigNumber.from(10).pow(18), expectedValue: '1 GLM' },
  { argument: BigNumber.from(10).pow(19).sub(1), expectedValue: '10 GLM' },
  { argument: BigNumber.from(10).pow(19), expectedValue: '10 GLM' },
  { argument: BigNumber.from(10).pow(20).sub(1), expectedValue: '100 GLM' },
  { argument: BigNumber.from(10).pow(20), expectedValue: '100 GLM' },
  { argument: BigNumber.from(10).pow(21).sub(1), expectedValue: '1000 GLM' },
  { argument: BigNumber.from(10).pow(21), expectedValue: '1000 GLM' },
  { argument: BigNumber.from(10).pow(22).sub(1), expectedValue: '10\u200a000 GLM' },
  { argument: BigNumber.from(10).pow(22), expectedValue: '10\u200a000 GLM' },
];

describe('getFormattedGlmValue', () => {
  for (const { argument, expectedValue } of testCases) {
    it(`returns ${expectedValue} for an argument ${formatUnits(argument)}`, () => {
      expect(getFormattedGlmValue(argument).fullString).toBe(expectedValue);
    });
  }
});
