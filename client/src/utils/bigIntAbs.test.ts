import bigIntAbs from './bigIntAbs';

describe('bigIntAbs', () => {
  it('correctly returns positive value when given positive value', () => {
    expect(bigIntAbs(BigInt(12))).toBe(12n);
  });

  it('correctly returns positive value when given negative value', () => {
    expect(bigIntAbs(BigInt(-12))).toBe(12n);
  });

  it('correctly returns 0 value when given 0 value', () => {
    expect(bigIntAbs(BigInt(0))).toBe(0n);
  });
});
