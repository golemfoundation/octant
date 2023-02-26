import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GOERLI_WITHDRAWALS_TARGET } from '../env';
import {
  ALLOCATIONS,
  ALLOCATIONS_STORAGE,
  DEPOSITS,
  OCTANT_ORACLE,
  PAYOUTS,
  PAYOUTS_MANAGER,
  TRACKER,
  TRACKER_WRAPPER,
  WITHDRAWALS_TARGET,
} from '../helpers/constants';
import {
  Allocations,
  AllocationsStorage,
  Deposits,
  OctantOracle,
  Payouts,
  PayoutsManager,
  Tracker,
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
  const withdrawalsTarget: WithdrawalsTarget = await hre.ethers.getContract(WITHDRAWALS_TARGET);
  const payoutsManager: PayoutsManager = await hre.ethers.getContract(PAYOUTS_MANAGER);
  const octantOracle: OctantOracle = await hre.ethers.getContract(OCTANT_ORACLE);
  await octantOracle.setTarget(withdrawalsTarget.address);
  await octantOracle.setPayoutsManager(payoutsManager.address);

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
  const payouts: Payouts = await hre.ethers.getContract(PAYOUTS);
  await payouts.setPayoutsManager(payoutsManager.address);
  const oracle = await ethers.getContract(OCTANT_ORACLE);
  const target: WithdrawalsTarget = await ethers.getContractAt(WITHDRAWALS_TARGET, targetAddress);
  await target.setHexagon(oracle.address);
};

export default func;
func.tags = ['setup', 'local', 'test', 'goerli'];
