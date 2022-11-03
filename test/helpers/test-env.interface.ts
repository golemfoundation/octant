import {
  Allocations,
  BeaconChainOracle,
  Deposits, Tracker,
  Epochs, HexagonOracle,
  Proposals, ExecutionLayerOracle,
  Token
} from '../../typechain-types';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

export type Signers = Record<string, SignerWithAddress>;

export interface TestEnv {
  signers: Signers;
  allocations: Allocations;
  proposals: Proposals;
  glmDeposits: Deposits;
  tracker: Tracker;
  token: Token;
  epochs: Epochs;
  beaconChainOracle: BeaconChainOracle;
  executionLayerOracle: ExecutionLayerOracle;
  hexagonOracle: HexagonOracle;
}
