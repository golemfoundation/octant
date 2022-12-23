import isAboveProposalDonationThresholdPercent from './isAboveProposalDonationThresholdPercent';

describe('isAboveProposalDonationThresholdPercent', () => {
  it('correctly returns true when the value is above threshold', () => {
    expect(isAboveProposalDonationThresholdPercent(11)).toBe(true);
  });

  it('correctly returns true when the value is the same as threshold', () => {
    expect(isAboveProposalDonationThresholdPercent(10)).toBe(true);
  });

  it('correctly returns true when the value is the same as threshold', () => {
    expect(isAboveProposalDonationThresholdPercent(10.01)).toBe(true);
  });

  it('correctly returns false when the value is below threshold', () => {
    expect(isAboveProposalDonationThresholdPercent(9.99)).toBe(false);
  });

  it('correctly returns false when the value is below threshold', () => {
    expect(isAboveProposalDonationThresholdPercent(9)).toBe(false);
  });
});
