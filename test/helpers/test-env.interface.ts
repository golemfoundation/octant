import {
  Allocations,
  BeaconChainOracle,
  Deposits, Tracker, Rewards,
  Epochs, HexagonOracle,
  Proposals, ExecutionLayerOracle,
  Token, AllocationsStorage, TestRewards, TestGLMFaucet
} from '../../typechain-types';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  signers: Signers;
  allocations: Allocations;
  allocationsStorage: AllocationsStorage;
  faucet: TestGLMFaucet;
  proposals: Proposals;
  glmDeposits: Deposits;
  tracker: Tracker;
  rewards: Rewards;
  testRewards: TestRewards;
  token: Token;
  epochs: Epochs;
  beaconChainOracle: BeaconChainOracle;
  executionLayerOracle: ExecutionLayerOracle;
  hexagonOracle: HexagonOracle;
}
