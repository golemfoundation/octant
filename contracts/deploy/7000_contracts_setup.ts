import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import {
  ALLOCATIONS,
  ALLOCATIONS_STORAGE,
  AUTH,
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
  Auth,
  Deposits,
  OctantOracle,
  Payouts,
  PayoutsManager,
  Tracker,
  WithdrawalsTarget,
} from '../typechain';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { TestFoundation } = await hre.ethers.getNamedSigners();

  // Setup Allocations
  const allocations: Allocations = await hre.ethers.getContract(ALLOCATIONS);
  const allocationsStorage: AllocationsStorage = await hre.ethers.getContract(ALLOCATIONS_STORAGE);
  await allocationsStorage.setAllocations(allocations.address);

  // Setup Deposits
  const deposits: Deposits = await hre.ethers.getContract(DEPOSITS);
  const tracker: Tracker = await hre.ethers.getContract(TRACKER);
  const trackerWrapper = await hre.ethers.getContract(TRACKER_WRAPPER);
  await deposits.setTrackerAddress(trackerWrapper.address);
  await tracker.setWrapperAddress(trackerWrapper.address);

  // Setup Payouts
  const withdrawalsTarget: WithdrawalsTarget = await hre.ethers.getContract(WITHDRAWALS_TARGET);
  const payoutsManager: PayoutsManager = await hre.ethers.getContract(PAYOUTS_MANAGER);
  const octantOracle: OctantOracle = await hre.ethers.getContract(OCTANT_ORACLE);
  const payouts: Payouts = await hre.ethers.getContract(PAYOUTS);

  await octantOracle.setTarget(withdrawalsTarget.address);
  await payouts.setPayoutsManager(payoutsManager.address);
  await withdrawalsTarget.setWithdrawer(octantOracle.address);

  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    // Test networks setup
    // TODO automate the flow for testnet deployment - OCT-364
    await withdrawalsTarget.connect(TestFoundation).setVault(payoutsManager.address);
  } else {
    // Live networks setup
    // Renounce deployer role
    const auth: Auth = await hre.ethers.getContract(AUTH);
    await auth.renounceDeployer();
  }
};

export default func;
func.tags = ['setup', 'local', 'test', 'goerli'];
