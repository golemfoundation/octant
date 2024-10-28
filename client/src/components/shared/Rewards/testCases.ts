export const getProgressPercentageTestCases = [
  {
    cutOffValue: BigInt(100),
    expectedValue: 0,
    name: 'should return 0 when totalValueOfAllocations is BigInt(0), cutOffValue is BigInt(0)',
    totalValueOfAllocations: BigInt(0),
  },
  {
    cutOffValue: BigInt(0),
    expectedValue: 0,
    name: 'should return 0 when totalValueOfAllocations is BigInt(0), cutOffValue is BigInt(0)',
    totalValueOfAllocations: BigInt(100),
  },
  {
    cutOffValue: BigInt(0),
    expectedValue: 0,
    name: 'should return 0 when totalValueOfAllocations is BigInt(0), cutOffValue is BigInt(0)',
    totalValueOfAllocations: BigInt(0),
  },
  {
    cutOffValue: BigInt(10),
    expectedValue: 100,
    name: 'should return positive number when totalValueOfAllocations is bigint>(0), cutOffValue is bigint>(0)',
    totalValueOfAllocations: BigInt(10),
  },
  {
    cutOffValue: BigInt(100),
    expectedValue: 10,
    name: 'should return positive number when totalValueOfAllocations is bigint>(0), cutOffValue is bigint>(0)',
    totalValueOfAllocations: BigInt(10),
  },
  {
    cutOffValue: BigInt(25),
    expectedValue: 40,
    name: 'should return positive number when totalValueOfAllocations is bigint>(0), cutOffValue is bigint>(0)',
    totalValueOfAllocations: BigInt(10),
  },
];
