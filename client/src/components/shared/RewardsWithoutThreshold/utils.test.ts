import { getProgressPercentageTestCases } from './testCases';
import { getProgressPercentage } from './utils';

describe('getProgressPercentage', () => {
  for (const {
    name,
    cutOffValue,
    expectedValue,
    totalValueOfAllocations,
  } of getProgressPercentageTestCases) {
    it(name, () => {
      expect(getProgressPercentage(totalValueOfAllocations, cutOffValue)).toBe(expectedValue);
    });
  }
});
