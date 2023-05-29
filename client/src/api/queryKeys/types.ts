import { SettingsData } from 'store/settings/types';

export type Root = {
  [key: string]: string;
};

export type QueryKeys = {
  availableFundsEth: string[];
  availableFundsGlm: string[];
  cryptoValues: (fiatCurrency: NonNullable<SettingsData['displayCurrency']>) => string[];
  cryptoValuesRoot: string[];
  currentBalance: string[];
  currentEpoch: string[];
  currentEpochEnd: string[];
  currentEpochProps: string[];
  depositAt: string[];
  depositAtGivenEpoch: (epochNumber: number) => string[];
  depositsValue: string[];
  glmLocked: string[];
  individualProposalRewards: string[];
  individualReward: string[];
  isDecisionWindowOpen: string[];
  lockedRatio: string[];
  locks: string[];
  matchedProposalRewards: string[];
  matchedRewards: string[];
  proposalAllocations: (proposalAddress: string) => string[];
  proposalRewardsThresholdFraction: string[];
  proposalsCid: string[];
  proposalsContract: string[];
  proposalsIpfsResults: (proposalAddress: string) => string[];
  unlocks: string[];
  userAllocations: string[];
  userHistoricAllocations: (userAddress: string) => string[];
  withdrawableUserEth: string[];
};
