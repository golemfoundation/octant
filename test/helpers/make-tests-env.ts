import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { solidity } from 'ethereum-waffle';

import { deployments, ethers } from 'hardhat';
import {
  PROPOSALS,
  DEPOSITS, TRACKER, REWARDS,
  TOKEN,
  ALLOCATIONS,
  EPOCHS,
  BEACON_CHAIN_ORACLE, EXECUTION_LAYER_ORACLE, HEXAGON_ORACLE
} from '../../helpers/constants';
import {
  Proposals,
  Deposits, Tracker, Rewards,
  Token,
  Allocations,
  Epochs,
  ExecutionLayerOracle, HexagonOracle, BeaconChainOracle
} from '../../typechain-types';
import { Signers, TestEnv } from './test-env.interface';

chai.use(bignumberChai());
chai.use(solidity);


const testEnv: TestEnv = {
  signers: {} as Signers,
  allocations: {} as Allocations,
  proposals: {} as Proposals,
  glmDeposits: {} as Deposits,
  tracker: {} as Tracker,
  rewards: {} as Rewards,
  token: {} as Token,
  epochs: {} as Epochs,
  beaconChainOracle: {} as BeaconChainOracle,
  executionLayerOracle: {} as ExecutionLayerOracle,
  hexagonOracle: {} as HexagonOracle,
};

async function initializeTestsEnv() {
  testEnv.signers = await ethers.getNamedSigners();
  testEnv.allocations = await ethers.getContract(ALLOCATIONS);
  testEnv.token = await ethers.getContract(TOKEN);
  testEnv.glmDeposits = await ethers.getContract(DEPOSITS);
  testEnv.tracker = await ethers.getContract(TRACKER);
  testEnv.rewards = await ethers.getContract(REWARDS);
  testEnv.proposals = await ethers.getContract(PROPOSALS);
  testEnv.epochs = await ethers.getContract(EPOCHS);
  testEnv.beaconChainOracle = await ethers.getContract(BEACON_CHAIN_ORACLE);
  testEnv.executionLayerOracle = await ethers.getContract(EXECUTION_LAYER_ORACLE);
  testEnv.hexagonOracle = await ethers.getContract(HEXAGON_ORACLE);
}

export function makeTestsEnv(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    beforeEach(async () => {
      await deployments.fixture(['test']);
      await initializeTestsEnv();
    });
    tests(testEnv);
  });
}
