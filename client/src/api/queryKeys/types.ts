import { SettingsData } from 'store/settings/types';

export type Root = {
  antisybilStatus: 'antisybilStatus';
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
  isGnosisSafeMultisig: 'isGnosisSafeMultisig';
  karmaGapMilestonesPerProjectPerGrantPerProgram: 'karmaGapMilestonesPerProjectPerGrantPerProgram';
  matchedProjectRewards: 'matchedProjectRewards';
  patronMode: 'patronMode';
  projectRewardsThreshold: 'projectRewardsThreshold';
  projectsDonors: 'projectsDonors';
  projectsEpoch: 'projectsEpoch';
  projectsIpfsResults: 'projectsIpfsResults';
  rewardsRate: 'rewardsRate';
  sablierStreams: 'sablierStreams';
  searchResultsDetails: 'searchResultsDetails';
  upcomingBudget: 'upcomingBudget';
  uqScore: 'uqScore';
  userAllocationNonce: 'userAllocationNonce';
  userAllocations: 'userAllocations';
  userTOS: 'userTOS';
};

export type QueryKeys = {
  allSablierStreams: ['allSablierStreams'];
  antisybilStatus: (userAddress: string) => [Root['antisybilStatus'], string];
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
  epochsIndexedBySubgraph: ['epochsIndexedBySubgraph'];
  estimatedEffectiveDeposit: (userAddress: string) => [Root['estimatedEffectiveDeposit'], string];
  history: ['history'];
  individualProjectRewards: ['individualProjectRewards'];
  individualReward: (epochNumber: number) => [Root['individualReward'], string];
  isDecisionWindowOpen: ['isDecisionWindowOpen'];
  isGnosisSafeMultisig: (userAddress: string) => [Root['isGnosisSafeMultisig'], string];
  karmaGapMilestonesPerProjectPerGrantPerProgram: (
    selectedProgramIds: string,
    projectAddress: string,
  ) => [Root['karmaGapMilestonesPerProjectPerGrantPerProgram'], string, string];
  largestLockedAmount: ['largestLockedAmount'];
  lockedSummaryLatest: ['lockedSummaryLatest'];
  lockedSummarySnapshots: ['lockedSummarySnapshots'];
  matchedProjectRewards: (epochNumber: number) => [Root['matchedProjectRewards'], string];
  patronMode: (userAddress: string) => [Root['patronMode'], string];
  projectRewardsThreshold: (epochNumber: number) => [Root['projectRewardsThreshold'], string];
  projectsDonors: (epochNumber: number) => [Root['projectsDonors'], string];
  projectsEpoch: (epochNumber: number) => [Root['projectsEpoch'], string];
  projectsIpfsResults: (
    projectAddress: string,
    epoch: number,
  ) => [Root['projectsIpfsResults'], string, string];
  projectsMetadataAccumulateds: ['projectsMetadataAccumulateds'];
  projectsMetadataPerEpoches: ['projectsMetadataPerEpoches'];
  rewardsRate: (epochNumber: number) => [Root['rewardsRate'], string];
  sablierStreams: (userAddress: string) => [Root['sablierStreams'], string];
  searchResults: ['searchResults'];
  searchResultsDetails: (
    address: string,
    epoch: number,
  ) => [Root['searchResultsDetails'], string, string];
  syncStatus: ['syncStatus'];
  totalAddresses: ['totalAddresses'];
  totalWithdrawals: ['totalWithdrawals'];
  unlocks: ['unlocks'];
  upcomingBudget: (userAddress: string) => [Root['upcomingBudget'], string];
  uqScore: (epochNumber: number) => [Root['uqScore'], string];
  userAllocationNonce: (userAddress: string) => [Root['userAllocationNonce'], string];
  userAllocations: (epochNumber: number) => [Root['userAllocations'], string];
  userTOS: (userAddress: string) => [Root['userTOS'], string];
  vimeoVideos: ['vimeoVideos'];
  withdrawals: ['withdrawals'];
};
