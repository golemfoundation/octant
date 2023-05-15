import {
  getCutOffValueBigNumberTestCases,
  getProgressPercentageTestCases,
  getCutOffValueNumberTestCases,
} from './testCases';
import { getCutOffValueNumber, getCutOffValueBigNumber, getProgressPercentage } from './utils';

describe('getCutOffValueNumber', () => {
  for (const {
    name,
    individualProposalRewardsSum,
    proposalRewardsThresholdFraction,
    expectedValue,
  } of getCutOffValueNumberTestCases) {
    it(name, () => {
      expect(
        getCutOffValueNumber(individualProposalRewardsSum, proposalRewardsThresholdFraction),
      ).toEqual(expectedValue);
    });
  }
});

describe('getCutOffValueBigNumberTestCases', () => {
  for (const {
    name,
    individualProposalRewardsSum,
    proposalRewardsThresholdFraction,
    expectedValue,
  } of getCutOffValueBigNumberTestCases) {
    it(name, () => {
      expect(
        getCutOffValueBigNumber(individualProposalRewardsSum, proposalRewardsThresholdFraction),
      ).toEqual(expectedValue);
    });
  }
});

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
