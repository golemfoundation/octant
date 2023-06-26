import { BigNumber } from 'ethers';

import getCutOffValueNumber from './getCutOffValueNumber';

export const getCutOffValueNumberTestCases = [
  {
    expectedValue: 0,
    individualProposalRewardsSum: undefined,
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum is undefined, proposalRewardsThresholdFraction is defined',
    proposalRewardsThresholdFraction: 0.05,
  },
  {
    expectedValue: 0,
    individualProposalRewardsSum: BigNumber.from(10),
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum is defined, proposalRewardsThresholdFraction is undefined',
    proposalRewardsThresholdFraction: undefined,
  },
  {
    expectedValue: 0,
    individualProposalRewardsSum: undefined,
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum is undefined, proposalRewardsThresholdFraction is undefined',
    proposalRewardsThresholdFraction: undefined,
  },
  {
    expectedValue: 5e-18,
    individualProposalRewardsSum: BigNumber.from(10),
    name: 'should return positive value when individualProposalRewardsSum and proposalRewardsThresholdFraction are defined',
    proposalRewardsThresholdFraction: 0.5,
  },
];

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
