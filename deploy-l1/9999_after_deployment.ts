import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  ALLOCATIONS,
  ALLOCATIONS_STORAGE,
  DEPOSITS,
  EPOCHS,
  PROPOSALS,
  REWARDS,
  TEST_REWARDS,
  TRACKER
} from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  // Prepare .env for client
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
  const testRewards = await hre.ethers.getContract(TEST_REWARDS);
  console.log(`VITE_TEST_REWARDS_ADDRESS=${testRewards.address}`);
};

export default func;
func.tags = ['after-deployment', 'goerli'];
