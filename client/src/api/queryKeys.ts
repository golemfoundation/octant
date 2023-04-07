import { SettingsData } from 'store/settings/types';

export const QUERY_KEYS = {
  availableFundsEth: ['availableFundsEth'],
  availableFundsGlm: ['availableFundsGlm'],
  cryptoValues: (fiatCurrency: NonNullable<SettingsData['displayCurrency']>): string[] => [
    ...QUERY_KEYS.cryptoValuesRoot,
    fiatCurrency,
  ],
  cryptoValuesRoot: ['cryptoValues'],
  currentBalance: ['currentBalance'],
  currentEpoch: ['currentEpoch'],
  currentEpochEnd: ['currentEpochEnd'],
  currentEpochProps: ['currentEpochProps'],
  depositAt: ['depositAt'],
  depositAtGivenEpoch: (epochNumber: number): string[] => [
    ...QUERY_KEYS.depositAt,
    epochNumber.toString(),
  ],
  depositsValue: ['depositsValue'],
  glmLocked: ['glmLocked'],
  individualReward: ['individualReward'],
  isDecisionWindowOpen: ['isDecisionWindowOpen'],
  lockedRatio: ['lockedRatio'],
  locks: ['locks'],
  matchedProposalRewards: ['matchedProposalRewards'],
  matchedRewards: ['matchedRewards'],
  proposalAllocations: (proposalAddress: string): string[] => [
    'proposalAllocations',
    proposalAddress,
  ],
  proposalRewardsThresholdFraction: ['proposalRewardsThresholdFraction'],
  proposalsCid: ['proposalsCid'],
  proposalsContract: ['proposalsContract'],
  proposalsIpfsResults: (proposalAddress: string): string[] => [
    'proposalsIpfsResults',
    proposalAddress,
  ],
  unlocks: ['unlocks'],
  userAllocations: ['userAllocations'],
  userHistoricAllocations: (userAddress: string): string[] => [
    'userHistoricAllocations',
    userAddress,
  ],
  withdrawableUserEth: ['withdrawableUserEth'],
};
