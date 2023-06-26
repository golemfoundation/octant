import { BigNumber } from 'ethers';

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
