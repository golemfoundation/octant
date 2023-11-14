import { SettingsData } from 'store/settings/types';

export type Root = {
  cryptoValues: 'cryptoValues';
  depositAt: 'depositAt';
  epochTimestampHappenedIn: 'epochTimestampHappenedIn';
  epochesEndTime: 'epochesEndTime';
  estimatedEffectiveDeposit: 'estimatedEffectiveDeposit';
  individualReward: 'individualReward';
  matchedProposalRewards: 'matchedProposalRewards';
  patronMode: 'patronMode';
  proposalDonors: 'proposalDonors';
  proposalRewardsThreshold: 'proposalRewardsThreshold';
  proposalsContract: 'proposalsContract';
  proposalsIpfsResults: 'proposalsIpfsResults';
  userAllocationNonce: 'userAllocationNonce';
  userAllocations: 'userAllocations';
  userTOS: 'userTOS';
};

export type QueryKeys = {
  blockNumber: ['blockNumber'];
  calculateRewards: (amount: string, days: number) => ['calculateRewards', string, string];
  cryptoValues: (
    fiatCurrency: NonNullable<SettingsData['displayCurrency']>,
  ) => [Root['cryptoValues'], NonNullable<SettingsData['displayCurrency']>];
  currentEpoch: ['currentEpoch'];
  currentEpochEnd: ['currentEpochEnd'];
  currentEpochProps: ['currentEpochProps'];
  depositsValue: ['depositsValue'];
  epochTimestampHappenedIn: (timestamp: number) => [Root['epochTimestampHappenedIn'], string];
  epochesEndTime: (epochNumber: number) => [Root['epochesEndTime'], string];
  estimatedEffectiveDeposit: (userAddress: string) => [Root['estimatedEffectiveDeposit'], string];
  glmClaimCheck: ['glmClaimCheck'];
  history: ['history'];
  individualProposalRewards: ['individualProposalRewards'];
  individualReward: (epochNumber: number) => [Root['individualReward'], string];
  isDecisionWindowOpen: ['isDecisionWindowOpen'];
  largestLockedAmount: ['largestLockedAmount'];
  lockedSummaryLatest: ['lockedSummaryLatest'];
  lockedSummarySnapshots: ['lockedSummarySnapshots'];
  matchedProposalRewards: (epochNumber: number) => [Root['matchedProposalRewards'], string];
  patronMode: (userAddress: string) => [Root['patronMode'], string];
  proposalDonors: (
    proposalAddress: string,
    epochNumber: number,
  ) => [Root['proposalDonors'], string, string];
  proposalRewardsThreshold: (epochNumber: number) => [Root['proposalRewardsThreshold'], string];
  proposalsAllIpfs: ['proposalsAllIpfs'];
  proposalsCid: ['proposalsCid'];
  proposalsContract: (epochNumber: number) => [Root['proposalsContract'], string];
  proposalsIpfsResults: (proposalAddress: string) => [Root['proposalsIpfsResults'], string];
  syncStatus: ['syncStatus'];
  totalAddresses: ['totalAddresses'];
  unlocks: ['unlocks'];
  userAllocationNonce: (userAddress: string) => [Root['userAllocationNonce'], string];
  userAllocations: (epochNumber: number) => [Root['userAllocations'], string];
  userTOS: (userAddress: string) => [Root['userTOS'], string];
  withdrawals: ['withdrawals'];
};
