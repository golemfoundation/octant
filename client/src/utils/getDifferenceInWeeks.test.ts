import getDifferenceInWeeks from './getDifferenceInWeeks';

const testCases = [
  {
    expectedValue: 75,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1640000000000,
  },
  {
    expectedValue: 67,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1645000000000,
  },
  {
    expectedValue: 58,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1650000000000,
  },
  {
    expectedValue: 50,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1655000000000,
  },
  {
    expectedValue: 42,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1660000000000,
  },
  {
    expectedValue: 33,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1665000000000,
  },
  {
    expectedValue: 25,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1670000000000,
  },
  {
    expectedValue: 17,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1675000000000,
  },
  {
    expectedValue: 9,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1680000000000,
  },
  {
    expectedValue: 0,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1685000000000,
  },
  {
    expectedValue: 0,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685531978660).getTime(),
  },
  {
    expectedValue: 0,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685534000000).getTime(),
  },
  {
    expectedValue: 0,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685536000000).getTime(),
  },
  {
    expectedValue: 0,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685539178760).getTime(),
  },
  {
    expectedValue: 7,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1690000000000,
  },
  {
    expectedValue: 15,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1695000000000,
  },
  {
    expectedValue: 23,
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1700000000000,
  },
];

describe('getDifferenceInWeeks', () => {
  for (const { fromTimestamp, toTimestamp, expectedValue } of testCases) {
    it(`returns ${expectedValue} for an arguments: fromTimestamp=${fromTimestamp} toTimestamp=${toTimestamp}`, () => {
      expect(getDifferenceInWeeks(fromTimestamp, toTimestamp)).toBe(expectedValue);
    });
  }
});
