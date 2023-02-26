import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import {
  ALLOCATIONS,
  ALLOCATIONS_STORAGE,
  OCTANT_ORACLE,
  DEPOSITS,
  EPOCHS,
  PROPOSALS,
  REWARDS,
  TRACKER,
} from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Prepare .env for client
  /* eslint-disable no-console */
  const allocations = await hre.ethers.getContract(ALLOCATIONS);
  console.log(`VITE_ALLOCATIONS_ADDRESS=${allocations.address}`);
  const allocationsStorage = await hre.ethers.getContract(ALLOCATIONS_STORAGE);
  console.log(`VITE_ALLOCATIONS_STORAGE_ADDRESS=${allocationsStorage.address}`);
  const deposits = await hre.ethers.getContract(DEPOSITS);
  console.log(`VITE_DEPOSITS_ADDRESS=${deposits.address}`);
  const tracker = await hre.ethers.getContract(TRACKER);
  console.log(`VITE_TRACKER_ADDRESS=${tracker.address}`);
  const epochs = await hre.ethers.getContract(EPOCHS);
  console.log(`VITE_EPOCHS_ADDRESS=${epochs.address}`);
  const proposals = await hre.ethers.getContract(PROPOSALS);
  console.log(`VITE_PROPOSALS_ADDRESS=${proposals.address}`);
  const rewards = await hre.ethers.getContract(REWARDS);
  console.log(`VITE_REWARDS_ADDRESS=${rewards.address}`);
  const octantOracle = await hre.ethers.getContract(OCTANT_ORACLE);
  console.log(`VITE_OCTANT_ORACLE_ADDRESS=${octantOracle.address}`);
  /* eslint-enable no-console */
};

export default func;
func.tags = ['after-deployment', 'goerli'];
