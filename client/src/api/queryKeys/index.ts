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
  currentBalance: ['currentBalance'],
  currentEpoch: ['currentEpoch'],
  currentEpochEnd: ['currentEpochEnd'],
  currentEpochProps: ['currentEpochProps'],
  depositAt: ['depositAt'],
  depositAtGivenEpoch: epochNumber => [ROOTS.depositAt, epochNumber.toString()],
  depositsValue: ['depositsValue'],
  history: ['history'],
  individualReward: ['individualReward'],
  isDecisionWindowOpen: ['isDecisionWindowOpen'],
  lockedRatio: ['lockedRatio'],
  locks: ['locks'],
  matchedProposalRewards: ['matchedProposalRewards'],
  proposalDonors: proposalAddress => [ROOTS.proposalDonors, proposalAddress],
  proposalRewardsThresholdFraction: ['proposalRewardsThresholdFraction'],
  proposalsCid: ['proposalsCid'],
  proposalsContract: ['proposalsContract'],
  proposalsIpfsResults: proposalAddress => [ROOTS.proposalsIpfsResults, proposalAddress],
  unlocks: ['unlocks'],
  userAllocations: ['userAllocations'],
  userHistoricAllocations: userAddress => [ROOTS.userHistoricAllocations, userAddress],
  usersAllocationsSum: ['usersAllocationsSum'],
  withdrawableUserEth: ['withdrawableUserEth'],
};
