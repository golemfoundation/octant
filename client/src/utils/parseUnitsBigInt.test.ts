import { parseUnitsBigInt } from './parseUnitsBigInt';

const testCases = [
  { expectedValue: BigInt(0), value: '0' },
  { expectedValue: BigInt(0), unit: 'ether', value: '0' },
  { expectedValue: BigInt(0), unit: 'wei', value: '0' },
  { expectedValue: BigInt(10) ** BigInt(0), value: '0.000000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(0), unit: 'ether', value: '0.000000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(0), unit: 'wei', value: '1' },
  { expectedValue: BigInt(10) ** BigInt(1), value: '0.00000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(1), unit: 'ether', value: '0.00000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(1), unit: 'wei', value: '10' },
  { expectedValue: BigInt(10) ** BigInt(2), value: '0.0000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(2), unit: 'ether', value: '0.0000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(2), unit: 'wei', value: '100' },
  { expectedValue: BigInt(10) ** BigInt(3), value: '0.000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(3), unit: 'ether', value: '0.000000000000001' },
  { expectedValue: BigInt(10) ** BigInt(3), unit: 'wei', value: '1000' },
  { expectedValue: BigInt(10) ** BigInt(4), value: '0.00000000000001' },
  { expectedValue: BigInt(10) ** BigInt(4), unit: 'ether', value: '0.00000000000001' },
  { expectedValue: BigInt(10) ** BigInt(4), unit: 'wei', value: '10000' },
  { expectedValue: BigInt(10) ** BigInt(5), value: '0.0000000000001' },
  { expectedValue: BigInt(10) ** BigInt(5), unit: 'ether', value: '0.0000000000001' },
  { expectedValue: BigInt(10) ** BigInt(5), unit: 'wei', value: '100000' },
  { expectedValue: BigInt(10) ** BigInt(6), value: '0.000000000001' },
  { expectedValue: BigInt(10) ** BigInt(6), unit: 'ether', value: '0.000000000001' },
  { expectedValue: BigInt(10) ** BigInt(6), unit: 'wei', value: '1000000' },
  { expectedValue: BigInt(10) ** BigInt(7), value: '0.00000000001' },
  { expectedValue: BigInt(10) ** BigInt(7), unit: 'ether', value: '0.00000000001' },
  { expectedValue: BigInt(10) ** BigInt(7), unit: 'wei', value: '10000000' },
  { expectedValue: BigInt(10) ** BigInt(8), value: '0.0000000001' },
  { expectedValue: BigInt(10) ** BigInt(8), unit: 'ether', value: '0.0000000001' },
  { expectedValue: BigInt(10) ** BigInt(8), unit: 'wei', value: '100000000' },
  { expectedValue: BigInt(10) ** BigInt(9), value: '0.000000001' },
  { expectedValue: BigInt(10) ** BigInt(9), unit: 'ether', value: '0.000000001' },
  { expectedValue: BigInt(10) ** BigInt(9), unit: 'wei', value: '1000000000' },
  { expectedValue: BigInt(10) ** BigInt(10), value: '0.00000001' },
  { expectedValue: BigInt(10) ** BigInt(10), unit: 'ether', value: '0.00000001' },
  { expectedValue: BigInt(10) ** BigInt(10), unit: 'wei', value: '10000000000' },
  { expectedValue: BigInt(10) ** BigInt(11), value: '0.0000001' },
  { expectedValue: BigInt(10) ** BigInt(11), unit: 'ether', value: '0.0000001' },
  { expectedValue: BigInt(10) ** BigInt(11), unit: 'wei', value: '100000000000' },
  { expectedValue: BigInt(10) ** BigInt(12), value: '0.000001' },
  { expectedValue: BigInt(10) ** BigInt(12), unit: 'ether', value: '0.000001' },
  { expectedValue: BigInt(10) ** BigInt(12), unit: 'wei', value: '1000000000000' },
  { expectedValue: BigInt(10) ** BigInt(13), value: '0.00001' },
  { expectedValue: BigInt(10) ** BigInt(13), unit: 'ether', value: '0.00001' },
  { expectedValue: BigInt(10) ** BigInt(13), unit: 'wei', value: '10000000000000' },
  { expectedValue: BigInt(10) ** BigInt(14), value: '0.0001' },
  { expectedValue: BigInt(10) ** BigInt(14), unit: 'ether', value: '0.0001' },
  { expectedValue: BigInt(10) ** BigInt(14), unit: 'wei', value: '100000000000000' },
  { expectedValue: BigInt(10) ** BigInt(15), value: '0.001' },
  { expectedValue: BigInt(10) ** BigInt(15), unit: 'ether', value: '0.001' },
  { expectedValue: BigInt(10) ** BigInt(15), unit: 'wei', value: '1000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(16), value: '0.01' },
  { expectedValue: BigInt(10) ** BigInt(16), unit: 'ether', value: '0.01' },
  { expectedValue: BigInt(10) ** BigInt(16), unit: 'wei', value: '10000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(17), value: '0.1' },
  { expectedValue: BigInt(10) ** BigInt(17), unit: 'ether', value: '0.1' },
  { expectedValue: BigInt(10) ** BigInt(17), unit: 'wei', value: '100000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(18), value: '1' },
  { expectedValue: BigInt(10) ** BigInt(18), unit: 'ether', value: '1' },
  { expectedValue: BigInt(10) ** BigInt(18), unit: 'wei', value: '1000000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(19), value: '10' },
  { expectedValue: BigInt(10) ** BigInt(19), unit: 'ether', value: '10' },
  { expectedValue: BigInt(10) ** BigInt(19), unit: 'wei', value: '10000000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(20), value: '100' },
  { expectedValue: BigInt(10) ** BigInt(20), unit: 'ether', value: '100' },
  { expectedValue: BigInt(10) ** BigInt(20), unit: 'wei', value: '100000000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(21), value: '1000' },
  { expectedValue: BigInt(10) ** BigInt(21), unit: 'ether', value: '1000' },
  { expectedValue: BigInt(10) ** BigInt(21), unit: 'wei', value: '1000000000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(22), value: '10000' },
  { expectedValue: BigInt(10) ** BigInt(22), unit: 'ether', value: '10000' },
  { expectedValue: BigInt(10) ** BigInt(22), unit: 'wei', value: '10000000000000000000000' },
  { expectedValue: BigInt(10) ** BigInt(22) + BigInt(13), value: '10000.000000000000000013' },
  {
    expectedValue: BigInt(10) ** BigInt(22) + BigInt(13),
    unit: 'ether',
    value: '10000.000000000000000013',
  },
  {
    expectedValue: BigInt(10) ** BigInt(22) + BigInt(13),
    unit: 'wei',
    value: '10000000000000000000013',
  },
  { expectedValue: BigInt(10) ** BigInt(22) + BigInt(1000), value: '10000.000000000000001' },
  {
    expectedValue: BigInt(10) ** BigInt(22) + BigInt(1000),
    unit: 'ether',
    value: '10000.000000000000001',
  },
  {
    expectedValue: BigInt(10) ** BigInt(22) + BigInt(1000),
    unit: 'wei',
    value: '10000000000000000001000',
  },
];

describe('parseUnitsBigInt', () => {
  for (const { value, unit, expectedValue } of testCases) {
    it(`returns ${expectedValue} for a value ${value} }`, () => {
      expect(parseUnitsBigInt(value, unit as any)).toBe(expectedValue);
    });
  }
});
