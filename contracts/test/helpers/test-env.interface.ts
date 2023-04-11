import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import {
  Auth,
  Allocations,
  AllocationsStorage,
  Deposits,
  Epochs,
  OctantOracle,
  Payouts,
  PayoutsManager,
  Proposals,
  Rewards,
  TestGLMFaucet,
  Token,
  Tracker,
  WithdrawalsTarget,
} from '../../typechain';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  allocations: Allocations;
  allocationsStorage: AllocationsStorage;
  auth: Auth;
  epochs: Epochs;
  faucet: TestGLMFaucet;
  glmDeposits: Deposits;
  octantOracle: OctantOracle;
  payouts: Payouts;
  payoutsManager: PayoutsManager;
  proposalAddresses: SignerWithAddress[];
  proposals: Proposals;
  rewards: Rewards;
  signers: Signers;
  target: WithdrawalsTarget;
  token: Token;
  tracker: Tracker;
}
