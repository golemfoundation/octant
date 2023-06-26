import { BigNumber } from 'ethers';

import getCutOffValueBigNumber from './getCutOffValueBigNumber';

export const testCases = [
  {
    expectedValue: BigNumber.from(0),
    individualProposalRewardsSum: undefined,
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum is undefined, proposalRewardsThresholdFraction is defined',
    proposalRewardsThresholdFraction: 0.5,
  },
  {
    expectedValue: BigNumber.from(0),
    individualProposalRewardsSum: BigNumber.from(10),
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum is defined, proposalRewardsThresholdFraction is undefined',
    proposalRewardsThresholdFraction: undefined,
  },
  {
    expectedValue: BigNumber.from(0),
    individualProposalRewardsSum: undefined,
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum is undefined, proposalRewardsThresholdFraction is undefined',
    proposalRewardsThresholdFraction: undefined,
  },
  {
    expectedValue: BigNumber.from(0),
    individualProposalRewardsSum: BigNumber.from(10),
    name: 'should return BigNumber.from(0) when individualProposalRewardsSum and proposalRewardsThresholdFraction are defined, but cutOffValueNumber is below 1 WEI',
    proposalRewardsThresholdFraction: 0.05,
  },
  {
    expectedValue: BigNumber.from(1),
    individualProposalRewardsSum: BigNumber.from(10),
    name: 'should return positive value when individualProposalRewardsSum and proposalRewardsThresholdFraction are defined, but cutOffValueNumber is 1 WEI',
    proposalRewardsThresholdFraction: 0.1,
  },
  {
    expectedValue: BigNumber.from(5),
    individualProposalRewardsSum: BigNumber.from(10),
    name: 'should return positive value when individualProposalRewardsSum and proposalRewardsThresholdFraction are defined',
    proposalRewardsThresholdFraction: 0.5,
  },
];

describe('getCutOffValueBigNumber', () => {
  for (const {
    name,
    individualProposalRewardsSum,
    proposalRewardsThresholdFraction,
    expectedValue,
  } of testCases) {
    it(name, () => {
      expect(
        getCutOffValueBigNumber(individualProposalRewardsSum, proposalRewardsThresholdFraction),
      ).toEqual(expectedValue);
    });
  }
});
