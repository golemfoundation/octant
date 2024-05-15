import { formatUnitsBigInt } from './formatUnitsBigInt';
import getFormattedGlmValue from './getFormattedGlmValue';

const testCases = [
  { argument: BigInt(0), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(0), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(1) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(2) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(2), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(3) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(3), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(4) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(4), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(5) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(5), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(6) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(6), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(7) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(7), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(8) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(8), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(9) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(9), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(10) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(10), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(11) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(11), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(12) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(12), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(13) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(13), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(14) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(14), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(15) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(15), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(16) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(16), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(17) - BigInt(1), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(17), expectedValue: '0 GLM' },
  { argument: BigInt(10) ** BigInt(18) - BigInt(1), expectedValue: '1 GLM' },
  { argument: BigInt(10) ** BigInt(18), expectedValue: '1 GLM' },
  { argument: BigInt(10) ** BigInt(19) - BigInt(1), expectedValue: '10 GLM' },
  { argument: BigInt(10) ** BigInt(19), expectedValue: '10 GLM' },
  { argument: BigInt(10) ** BigInt(20) - BigInt(1), expectedValue: '100 GLM' },
  { argument: BigInt(10) ** BigInt(20), expectedValue: '100 GLM' },
  { argument: BigInt(10) ** BigInt(21) - BigInt(1), expectedValue: '1000 GLM' },
  { argument: BigInt(10) ** BigInt(21), expectedValue: '1000 GLM' },
  { argument: BigInt(10) ** BigInt(22) - BigInt(1), expectedValue: '10\u200a000 GLM' },
  { argument: BigInt(10) ** BigInt(22), expectedValue: '10\u200a000 GLM' },
];

describe('getFormattedGlmValue', () => {
  for (const { argument, expectedValue } of testCases) {
    it(`returns ${expectedValue} for an argument ${formatUnitsBigInt(
      argument,
    )} when isUsingHairSpace`, () => {
      expect(getFormattedGlmValue({ value: argument }).fullString).toBe(expectedValue);
    });

    const expectedValueNormalSpace = expectedValue.replace(/\u200a/g, ' ');
    it(`returns ${expectedValueNormalSpace} for an argument ${formatUnitsBigInt(
      argument,
    )} when !isUsingHairSpace`, () => {
      expect(getFormattedGlmValue({ isUsingHairSpace: false, value: argument }).fullString).toBe(
        expectedValueNormalSpace,
      );
    });
  }
});
