import { SettingsData } from 'store/settings/types';

export type Root = {
  cryptoValues: 'cryptoValues';
  depositAt: 'depositAt';
  proposalAllocations: 'proposalAllocations';
  proposalsIpfsResults: 'proposalsIpfsResults';
  userHistoricAllocations: 'userHistoricAllocations';
};

export type QueryKeys = {
  cryptoValues: (
    fiatCurrency: NonNullable<SettingsData['displayCurrency']>,
  ) => [Root['cryptoValues'], NonNullable<SettingsData['displayCurrency']>];
  currentBalance: ['currentBalance'];
  currentEpoch: ['currentEpoch'];
  currentEpochEnd: ['currentEpochEnd'];
  currentEpochProps: ['currentEpochProps'];
  depositAt: ['depositAt'];
  depositAtGivenEpoch: (epochNumber: number) => [Root['depositAt'], string];
  depositsValue: ['depositsValue'];
  glmLocked: ['glmLocked'];
  individualProposalRewards: ['individualProposalRewards'];
  individualReward: ['individualReward'];
  isDecisionWindowOpen: ['isDecisionWindowOpen'];
  lockedRatio: ['lockedRatio'];
  locks: ['locks'];
  matchedProposalRewards: ['matchedProposalRewards'];
  matchedRewards: ['matchedRewards'];
  proposalAllocations: (proposalAddress: string) => [Root['proposalAllocations'], string];
  proposalRewardsThresholdFraction: ['proposalRewardsThresholdFraction'];
  proposalsCid: ['proposalsCid'];
  proposalsContract: ['proposalsContract'];
  proposalsIpfsResults: (proposalAddress: string) => [Root['proposalsIpfsResults'], string];
  unlocks: ['unlocks'];
  userAllocations: ['userAllocations'];
  userHistoricAllocations: (userAddress: string) => [Root['userHistoricAllocations'], string];
  withdrawableUserEth: ['withdrawableUserEth'];
};
