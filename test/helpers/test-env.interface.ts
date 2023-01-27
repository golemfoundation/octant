import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import {
  Allocations,
  AllocationsStorage,
  BeaconChainOracle,
  Deposits,
  Epochs,
  ExecutionLayerOracle,
  HexagonOracle,
  Proposals,
  Rewards,
  TestGLMFaucet,
  TestRewards,
  Token,
  Tracker,
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
  proposals: Proposals;
  rewards: Rewards;
  signers: Signers;
  testRewards: TestRewards;
  token: Token;
  tracker: Tracker;
}
