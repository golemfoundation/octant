import { BigNumber } from 'ethers';

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

export const getCutOffValueBigNumberTestCases = [
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

export const getProgressPercentageTestCases = [
  {
    cutOffValue: BigNumber.from(100),
    expectedValue: 0,
    name: 'should return 0 when totalValueOfAllocations is BigNumber.from(0), cutOffValue is BigNumber.from(0)',
    totalValueOfAllocations: BigNumber.from(0),
  },
  {
    cutOffValue: BigNumber.from(0),
    expectedValue: 0,
    name: 'should return 0 when totalValueOfAllocations is BigNumber.from(0), cutOffValue is BigNumber.from(0)',
    totalValueOfAllocations: BigNumber.from(100),
  },
  {
    cutOffValue: BigNumber.from(0),
    expectedValue: 0,
    name: 'should return 0 when totalValueOfAllocations is BigNumber.from(0), cutOffValue is BigNumber.from(0)',
    totalValueOfAllocations: BigNumber.from(0),
  },
  {
    cutOffValue: BigNumber.from(10),
    expectedValue: 100,
    name: 'should return positive number when totalValueOfAllocations is BigNumber.gt(0), cutOffValue is BigNumber.gt(0)',
    totalValueOfAllocations: BigNumber.from(10),
  },
  {
    cutOffValue: BigNumber.from(100),
    expectedValue: 10,
    name: 'should return positive number when totalValueOfAllocations is BigNumber.gt(0), cutOffValue is BigNumber.gt(0)',
    totalValueOfAllocations: BigNumber.from(10),
  },
  {
    cutOffValue: BigNumber.from(25),
    expectedValue: 40,
    name: 'should return positive number when totalValueOfAllocations is BigNumber.gt(0), cutOffValue is BigNumber.gt(0)',
    totalValueOfAllocations: BigNumber.from(10),
  },
];
