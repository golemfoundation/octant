import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import {
  BEACONCHAIN_VALIDATOR_INDEXES,
  EXECUTION_LAYER_VALIDATOR_ADDRESS,
  GOERLI_WITHDRAWALS_TARGET,
} from '../env';
import {
  ALLOCATIONS,
  ALLOCATIONS_STORAGE,
  BEACON_CHAIN_ORACLE,
  DEPOSITS,
  EXECUTION_LAYER_ORACLE,
  PAYOUTS_MANAGER,
  TRACKER,
  TRACKER_WRAPPER,
  WITHDRAWALS_TARGET,
} from '../helpers/constants';
import {
  Allocations,
  AllocationsStorage,
  BeaconChainOracle,
  Deposits,
  ExecutionLayerOracle,
  Tracker,
  PayoutsManager,
  WithdrawalsTarget,
} from '../typechain-types';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Setup Allocations
  const allocations: Allocations = await hre.ethers.getContract(ALLOCATIONS);
  const allocationsStorage: AllocationsStorage = await hre.ethers.getContract(ALLOCATIONS_STORAGE);
  await allocationsStorage.transferOwnership(allocations.address);

  // Setup Oracle
  const validatorIndexes = BEACONCHAIN_VALIDATOR_INDEXES;
  let validatorAddress = EXECUTION_LAYER_VALIDATOR_ADDRESS;
  if (hre.network.name === 'hardhat') {
    const { Alice } = await hre.ethers.getNamedSigners();
    validatorAddress = Alice.address;
  }
  const beaconChainOracle: BeaconChainOracle = await hre.ethers.getContract(BEACON_CHAIN_ORACLE);
  const executionLayerOracle: ExecutionLayerOracle = await hre.ethers.getContract(
    EXECUTION_LAYER_ORACLE,
  );
  await beaconChainOracle.setValidatorIndexes(validatorIndexes);
  await executionLayerOracle.setFeeAddress(validatorAddress);

  // Setup Deposits
  const deposits: Deposits = await hre.ethers.getContract(DEPOSITS);
  const tracker: Tracker = await hre.ethers.getContract(TRACKER);
  const trackerWrapper = await hre.ethers.getContract(TRACKER_WRAPPER);
  await deposits.setDepositTrackerAddress(trackerWrapper.address);
  await tracker.setProxyAddress(trackerWrapper.address);

  // Setup Payouts
  let targetAddress = GOERLI_WITHDRAWALS_TARGET;
  if (hre.network.name === 'hardhat') {
    const target = await ethers.getContract(WITHDRAWALS_TARGET);
    targetAddress = target.address;
  }
  const manager: PayoutsManager = await ethers.getContract(PAYOUTS_MANAGER);
  await manager.setTarget(targetAddress);

  const target: WithdrawalsTarget = await ethers.getContractAt(WITHDRAWALS_TARGET, targetAddress);
  await target.setHexagon(manager.address);
};

export default func;
func.tags = ['setup', 'local', 'test', 'goerli'];
