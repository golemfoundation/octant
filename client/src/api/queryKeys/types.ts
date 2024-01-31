import { SettingsData } from 'store/settings/types';

export type Root = {
  calculateRewards: 'calculateRewards';
  cryptoValues: 'cryptoValues';
  depositAt: 'depositAt';
  epochBudgets: 'epochBudgets';
  epochDonors: 'epochDonors';
  epochInfo: 'epochInfo';
  epochLeverage: 'epochLeverage';
  epochPatrons: 'epochPatrons';
  epochTimestampHappenedIn: 'epochTimestampHappenedIn';
  epochUnusedRewards: 'epochUnusedRewards';
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
  calculateRewards: (amount: string, days: number) => [Root['calculateRewards'], string, string];
  cryptoValues: (
    fiatCurrency: NonNullable<SettingsData['displayCurrency']>,
  ) => [Root['cryptoValues'], NonNullable<SettingsData['displayCurrency']>];
  currentEpoch: ['currentEpoch'];
  currentEpochEnd: ['currentEpochEnd'];
  currentEpochProps: ['currentEpochProps'];
  depositsValue: ['depositsValue'];
  epochBudgets: (epoch: number) => [Root['epochBudgets'], string];
  epochDonors: (epoch: number) => [Root['epochDonors'], string];
  epochInfo: (epoch: number) => [Root['epochInfo'], string];
  epochLeverage: (epoch: number) => [Root['epochLeverage'], string];
  epochPatrons: (epoch: number) => [Root['epochPatrons'], string];
  epochTimestampHappenedIn: (timestamp: number) => [Root['epochTimestampHappenedIn'], string];
  epochUnusedRewards: (epoch: number) => [Root['epochUnusedRewards'], string];
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
  projectsMetadataAccumulateds: ['projectsMetadataAccumulateds'];
  projectsMetadataPerEpoches: ['projectsMetadataPerEpoches'];
  proposalDonors: (
    proposalAddress: string,
    epochNumber: number,
  ) => [Root['proposalDonors'], string, string];
  proposalRewardsThreshold: (epochNumber: number) => [Root['proposalRewardsThreshold'], string];
  proposalsContract: (epochNumber: number) => [Root['proposalsContract'], string];
  proposalsIpfsResults: (
    proposalAddress: string,
    epoch: number,
  ) => [Root['proposalsIpfsResults'], string, string];
  syncStatus: ['syncStatus'];
  totalAddresses: ['totalAddresses'];
  unlocks: ['unlocks'];
  userAllocationNonce: (userAddress: string) => [Root['userAllocationNonce'], string];
  userAllocations: (epochNumber: number) => [Root['userAllocations'], string];
  userTOS: (userAddress: string) => [Root['userTOS'], string];
  withdrawals: ['withdrawals'];
};
