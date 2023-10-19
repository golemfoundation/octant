import getTimeDistance from './getTimeDistance';

const testCases = [
  {
    expectedValue: 'over 1 year',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1640000000000,
  },
  {
    expectedValue: 'over 1 year',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1645000000000,
  },
  {
    expectedValue: 'about 1 year',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1650000000000,
  },
  {
    expectedValue: '12 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1655000000000,
  },
  {
    expectedValue: '10 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1660000000000,
  },
  {
    expectedValue: '8 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1665000000000,
  },
  {
    expectedValue: '6 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1670000000000,
  },
  {
    expectedValue: '4 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1675000000000,
  },
  {
    expectedValue: '2 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1680000000000,
  },
  {
    expectedValue: '6 days',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1685000000000,
  },
  {
    expectedValue: 'less than 1m',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685531919660).getTime(),
  },
  {
    expectedValue: '34 minutes',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685534000000).getTime(),
  },
  {
    expectedValue: 'about 1 hour',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685536000000).getTime(),
  },
  {
    expectedValue: 'about 2 hours',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: new Date(1685539178760).getTime(),
  },
  {
    expectedValue: 'about 2 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1690000000000,
  },
  {
    expectedValue: '4 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1695000000000,
  },
  {
    expectedValue: '6 months',
    fromTimestamp: new Date(1685531978660).getTime(),
    toTimestamp: 1700000000000,
  },
];

describe('getTimeDistance', () => {
  for (const { fromTimestamp, toTimestamp, expectedValue } of testCases) {
    it(`returns ${expectedValue} for an arguments: fromTimestamp=${fromTimestamp} toTimestamp=${toTimestamp}`, () => {
      expect(getTimeDistance(fromTimestamp, toTimestamp)).toBe(expectedValue);
    });
  }
});
