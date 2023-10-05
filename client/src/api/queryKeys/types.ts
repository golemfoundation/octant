import { SettingsData } from 'store/settings/types';

export type Root = {
  cryptoValues: 'cryptoValues';
  depositAt: 'depositAt';
  epochesEndTime: 'epochesEndTime';
  matchedProposalRewards: 'matchedProposalRewards';
  proposalDonors: 'proposalDonors';
  proposalsContract: 'proposalsContract';
  proposalsIpfsResults: 'proposalsIpfsResults';
  userAllocations: 'userAllocations';
  userHistoricAllocations: 'userHistoricAllocations';
  userTOS: 'userTOS';
};

export type QueryKeys = {
  blockNumber: ['blockNumber'];
  cryptoValues: (
    fiatCurrency: NonNullable<SettingsData['displayCurrency']>,
  ) => [Root['cryptoValues'], NonNullable<SettingsData['displayCurrency']>];
  currentEpoch: ['currentEpoch'];
  currentEpochEnd: ['currentEpochEnd'];
  currentEpochProps: ['currentEpochProps'];
  depositAtGivenEpoch: (epochNumber: number) => [Root['depositAt'], string];
  depositsValue: ['depositsValue'];
  epochesEndTime: (epochNumber: number) => [Root['epochesEndTime'], string];
  glmClaimCheck: ['glmClaimCheck'];
  history: ['history'];
  individualProposalRewards: ['individualProposalRewards'];
  individualReward: ['individualReward'];
  isDecisionWindowOpen: ['isDecisionWindowOpen'];
  lockedSummaryLatest: ['lockedSummaryLatest'];
  matchedProposalRewards: (epochNumber: number) => [Root['matchedProposalRewards'], string];
  proposalDonors: (proposalAddress: string) => [Root['proposalDonors'], string];
  proposalRewardsThreshold: ['proposalRewardsThreshold'];
  proposalsAllIpfs: ['proposalsAllIpfs'];
  proposalsCid: ['proposalsCid'];
  proposalsContract: (epochNumber: number) => [Root['proposalsContract'], string];
  proposalsIpfsResults: (proposalAddress: string) => [Root['proposalsIpfsResults'], string];
  unlocks: ['unlocks'];
  userAllocations: (epochNumber: number) => [Root['userAllocations'], string];
  userHistoricAllocations: (userAddress: string) => [Root['userHistoricAllocations'], string];
  userTOS: (userAddress: string) => [Root['userTOS'], string];
  withdrawableUserEth: ['withdrawableUserEth'];
};
