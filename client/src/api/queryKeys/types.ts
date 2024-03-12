import { SettingsData } from 'store/settings/types';

export type Root = {
  calculateRewards: 'calculateRewards';
  cryptoValues: 'cryptoValues';
  depositAt: 'depositAt';
  epochAllocations: 'epochAllocations';
  epochBudgets: 'epochBudgets';
  epochInfo: 'epochInfo';
  epochLeverage: 'epochLeverage';
  epochPatrons: 'epochPatrons';
  epochTimestampHappenedIn: 'epochTimestampHappenedIn';
  epochUnusedRewards: 'epochUnusedRewards';
  epochesEndTime: 'epochesEndTime';
  estimatedEffectiveDeposit: 'estimatedEffectiveDeposit';
  individualReward: 'individualReward';
  matchedProjectRewards: 'matchedProjectRewards';
  patronMode: 'patronMode';
  projectDonors: 'projectDonors';
  projectRewardsThreshold: 'projectRewardsThreshold';
  projectsContract: 'projectsContract';
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
  epochAllocations: (epoch: number) => [Root['epochAllocations'], string];
  epochBudgets: (epoch: number) => [Root['epochBudgets'], string];
  epochInfo: (epoch: number) => [Root['epochInfo'], string];
  epochLeverage: (epoch: number) => [Root['epochLeverage'], string];
  epochPatrons: (epoch: number) => [Root['epochPatrons'], string];
  epochTimestampHappenedIn: (timestamp: number) => [Root['epochTimestampHappenedIn'], string];
  epochUnusedRewards: (epoch: number) => [Root['epochUnusedRewards'], string];
  epochesEndTime: (epochNumber: number) => [Root['epochesEndTime'], string];
  estimatedEffectiveDeposit: (userAddress: string) => [Root['estimatedEffectiveDeposit'], string];
  history: ['history'];
  individualProposalRewards: ['individualProposalRewards'];
  individualReward: (epochNumber: number) => [Root['individualReward'], string];
  isDecisionWindowOpen: ['isDecisionWindowOpen'];
  largestLockedAmount: ['largestLockedAmount'];
  lockedSummaryLatest: ['lockedSummaryLatest'];
  lockedSummarySnapshots: ['lockedSummarySnapshots'];
  matchedProjectRewards: (epochNumber: number) => [Root['matchedProjectRewards'], string];
  patronMode: (userAddress: string) => [Root['patronMode'], string];
  projectDonors: (
    proposalAddress: string,
    epochNumber: number,
  ) => [Root['projectDonors'], string, string];
  projectRewardsThreshold: (epochNumber: number) => [Root['projectRewardsThreshold'], string];
  projectsContract: (epochNumber: number) => [Root['projectsContract'], string];
  projectsMetadataAccumulateds: ['projectsMetadataAccumulateds'];
  projectsMetadataPerEpoches: ['projectsMetadataPerEpoches'];
  proposalsIpfsResults: (
    proposalAddress: string,
    epoch: number,
  ) => [Root['proposalsIpfsResults'], string, string];
  syncStatus: ['syncStatus'];
  totalAddresses: ['totalAddresses'];
  totalWithdrawals: ['totalWithdrawals'];
  unlocks: ['unlocks'];
  userAllocationNonce: (userAddress: string) => [Root['userAllocationNonce'], string];
  userAllocations: (epochNumber: number) => [Root['userAllocations'], string];
  userTOS: (userAddress: string) => [Root['userTOS'], string];
  withdrawals: ['withdrawals'];
};
