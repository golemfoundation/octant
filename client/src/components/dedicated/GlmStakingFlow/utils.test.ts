import { getButtonCtaLabel } from './utils';

describe('getButtonCtaLabel', () => {
  it('when currentStepIndex equals 0, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('lock', 0, false)).toBe('Lock');
    expect(getButtonCtaLabel('unlock', 0, false)).toBe('Unlock');
  });

  it('when currentStepIndex equals 1, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('lock', 1, false)).toBe('Lock');
    expect(getButtonCtaLabel('unlock', 1, false)).toBe('Unlock');
  });

  it('when currentStepIndex equals 2, currentMode decides what is returned', () => {
    expect(getButtonCtaLabel('lock', 2, false)).toBe('Lock');
    expect(getButtonCtaLabel('unlock', 2, false)).toBe('Unlock');
  });

  it("when currentStepIndex equals 3, regardless of currentMode, 'Done' is returned", () => {
    expect(getButtonCtaLabel('lock', 3, false)).toBe('Done');
    expect(getButtonCtaLabel('unlock', 3, false)).toBe('Done');
  });

  it("when currentStepIndex equals 3 & isLoading is true, 'Done' is returned", () => {
    expect(getButtonCtaLabel('lock', 3, true)).toBe('Done');
    expect(getButtonCtaLabel('unlock', 3, true)).toBe('Done');
  });

  it("when currentStepIndex doesn't equal 3 & isLoading is true, 'Waiting for approval...' is returned", () => {
    expect(getButtonCtaLabel('lock', 0, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('unlock', 0, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('lock', 1, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('unlock', 1, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('lock', 2, true)).toBe('Waiting for approval...');
    expect(getButtonCtaLabel('unlock', 2, true)).toBe('Waiting for approval...');
  });
});
