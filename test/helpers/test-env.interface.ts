import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import {
  Allocations,
  AllocationsStorage,
  BeaconChainOracle,
  Deposits,
  Epochs,
  ExecutionLayerOracle,
  HexagonOracle,
  Payouts,
  PayoutsManager,
  Proposals,
  Rewards,
  TestGLMFaucet,
  Token,
  Tracker,
  WithdrawalsTarget,
} from '../../typechain-types';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  allocations: Allocations;
  allocationsStorage: AllocationsStorage;
  beaconChainOracle: BeaconChainOracle;
  epochs: Epochs;
  executionLayerOracle: ExecutionLayerOracle;
  faucet: TestGLMFaucet;
  glmDeposits: Deposits;
  hexagonOracle: HexagonOracle;
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
