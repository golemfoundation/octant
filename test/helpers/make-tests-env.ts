import { smock } from '@defi-wonderland/smock';
import chai from 'chai';
import { deployments, ethers } from 'hardhat';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';

import { Signers, TestEnv } from './test-env.interface';

import {
  ALLOCATIONS,
  ALLOCATIONS_STORAGE,
  BEACON_CHAIN_ORACLE,
  DEPOSITS,
  EPOCHS,
  EXECUTION_LAYER_ORACLE,
  FAUCET,
  HEXAGON_ORACLE,
  PAYOUTS,
  PAYOUTS_MANAGER,
  PROPOSALS,
  REWARDS,
  WITHDRAWALS_TARGET,
  TOKEN,
  TRACKER,
} from '../../helpers/constants';
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

chai.use(smock.matchers);

const testEnv: TestEnv = {
  allocations: {} as Allocations,
  allocationsStorage: {} as AllocationsStorage,
  beaconChainOracle: {} as BeaconChainOracle,
  epochs: {} as Epochs,
  executionLayerOracle: {} as ExecutionLayerOracle,
  faucet: {} as TestGLMFaucet,
  glmDeposits: {} as Deposits,
  hexagonOracle: {} as HexagonOracle,
  payouts: {} as Payouts,
  payoutsManager: {} as PayoutsManager,
  proposalAddresses: {} as SignerWithAddress[],
  proposals: {} as Proposals,
  rewards: {} as Rewards,
  signers: {} as Signers,
  target: {} as WithdrawalsTarget,
  token: {} as Token,
  tracker: {} as Tracker,
};

async function initializeTestsEnv() {
  testEnv.signers = await ethers.getNamedSigners();
  testEnv.proposalAddresses = await ethers
    .getUnnamedSigners()
    .then(proposals => proposals.slice(0, 10));
  testEnv.allocations = await ethers.getContract(ALLOCATIONS);
  testEnv.allocationsStorage = await ethers.getContract(ALLOCATIONS_STORAGE);
  testEnv.faucet = await ethers.getContract(FAUCET);
  testEnv.token = await ethers.getContract(TOKEN);
  testEnv.glmDeposits = await ethers.getContract(DEPOSITS);
  testEnv.tracker = await ethers.getContract(TRACKER);
  testEnv.rewards = await ethers.getContract(REWARDS);
  testEnv.target = await ethers.getContract(WITHDRAWALS_TARGET);
  testEnv.payouts = await ethers.getContract(PAYOUTS);
  testEnv.payoutsManager = await ethers.getContract(PAYOUTS_MANAGER);
  testEnv.proposals = await ethers.getContract(PROPOSALS);
  testEnv.epochs = await ethers.getContract(EPOCHS);
  testEnv.beaconChainOracle = await ethers.getContract(BEACON_CHAIN_ORACLE);
  testEnv.executionLayerOracle = await ethers.getContract(EXECUTION_LAYER_ORACLE);
  testEnv.hexagonOracle = await ethers.getContract(HEXAGON_ORACLE);
}

export function makeTestsEnv(name: string, tests: (testEnvToMake: TestEnv) => void): void {
  describe(name, () => {
    beforeEach(async () => {
      await deployments.fixture(['test']);
      await initializeTestsEnv();
    });
    tests(testEnv);
  });
}
