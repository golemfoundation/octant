import { PROPOSAL_DONATION_THRESHOLD_PERCENT } from 'constants/proposals';

export default function isAboveProposalDonationThresholdPercent(number: number): boolean {
  return number >= PROPOSAL_DONATION_THRESHOLD_PERCENT;
}
