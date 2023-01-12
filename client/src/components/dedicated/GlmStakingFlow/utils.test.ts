import { getButtonCtaLabel } from './utils';

describe('getButtonCtaLabel', () => {
  it('when currentStepIndex equals 0, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('deposit', 0)).toBe('Stake');
    expect(getButtonCtaLabel('withdraw', 0)).toBe('Unstake');
  });

  it('when currentStepIndex equals 1, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('deposit', 1)).toBe('Stake');
    expect(getButtonCtaLabel('withdraw', 1)).toBe('Unstake');
  });

  it('when currentStepIndex equals 2, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('deposit', 2)).toBe('Stake');
    expect(getButtonCtaLabel('withdraw', 2)).toBe('Unstake');
  });

  it("when currentStepIndex equals 3, regardless of currentMode, return is 'Done'", () => {
    expect(getButtonCtaLabel('deposit', 3)).toBe('Done');
    expect(getButtonCtaLabel('withdraw', 3)).toBe('Done');
  });
});
