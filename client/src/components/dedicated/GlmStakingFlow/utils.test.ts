import { getButtonCtaLabel } from './utils';

describe('getButtonCtaLabel', () => {
  it('when currentStepIndex equals 0, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('deposit', 0, false)).toBe('Stake');
    expect(getButtonCtaLabel('withdraw', 0, false)).toBe('Unstake');
  });

  it('when currentStepIndex equals 1, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('deposit', 1, false)).toBe('Stake');
    expect(getButtonCtaLabel('withdraw', 1, false)).toBe('Unstake');
  });

  it('when currentStepIndex equals 2, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('deposit', 2, false)).toBe('Stake');
    expect(getButtonCtaLabel('withdraw', 2, false)).toBe('Unstake');
  });

  it("when currentStepIndex equals 3, regardless of currentMode, 'Done' is returned", () => {
    expect(getButtonCtaLabel('deposit', 3, false)).toBe('Done');
    expect(getButtonCtaLabel('withdraw', 3, false)).toBe('Done');
  });

  it("when currentStepIndex equals 3 & isLoading is true, 'Done' is returned", () => {
    expect(getButtonCtaLabel('deposit', 3, true)).toBe('Done');
    expect(getButtonCtaLabel('withdraw', 3, true)).toBe('Done');
  });

  it("when currentStepIndex doesn't equal 3 & isLoading is true, 'Waiting for approval...' is returned", () => {
    expect(getButtonCtaLabel('deposit', 0, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('withdraw', 0, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('deposit', 1, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('withdraw', 1, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('deposit', 2, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('withdraw', 2, true)).toBe('Waiting for approval...');
  });
});
