import { Root, QueryKeys } from './types';

export const ROOTS: Root = {
  cryptoValues: 'cryptoValues',
  depositAt: 'depositAt',
  proposalDonors: 'proposalDonors',
  proposalsIpfsResults: 'proposalsIpfsResults',
  userHistoricAllocations: 'userHistoricAllocations',
};

export const QUERY_KEYS: QueryKeys = {
  cryptoValues: fiatCurrency => [ROOTS.cryptoValues, fiatCurrency],
  currentEpoch: ['currentEpoch'],
  currentEpochEnd: ['currentEpochEnd'],
  currentEpochProps: ['currentEpochProps'],
  depositAtGivenEpoch: epochNumber => [ROOTS.depositAt, epochNumber.toString()],
  depositsValue: ['depositsValue'],
  history: ['history'],
  individualReward: ['individualReward'],
  isDecisionWindowOpen: ['isDecisionWindowOpen'],
  lockedSummaryLatest: ['lockedSummaryLatest'],
  matchedProposalRewards: ['matchedProposalRewards'],
  proposalDonors: proposalAddress => [ROOTS.proposalDonors, proposalAddress],
  proposalRewardsThreshold: ['proposalRewardsThreshold'],
  proposalsCid: ['proposalsCid'],
  proposalsContract: ['proposalsContract'],
  proposalsIpfsResults: proposalAddress => [ROOTS.proposalsIpfsResults, proposalAddress],
  unlocks: ['unlocks'],
  userAllocations: ['userAllocations'],
  userHistoricAllocations: userAddress => [ROOTS.userHistoricAllocations, userAddress],
  withdrawableUserEth: ['withdrawableUserEth'],
};
