import fs from 'fs';
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
  PAYOUTS_MANAGER,
  PAYOUTS,
  WITHDRAWALS_TARGET,
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
  const payoutsManager = await hre.ethers.getContract(PAYOUTS_MANAGER);
  console.log(`VITE_OCTANT_PAYOUTS_MANAGER_ADDRESS=${payoutsManager.address}`);
  const payouts = await hre.ethers.getContract(PAYOUTS);
  console.log(`VITE_OCTANT_PAYOUTS_ADDRESS=${payouts.address}`);
  const withdrawalsTarget = await hre.ethers.getContract(WITHDRAWALS_TARGET);
  console.log(`VITE_WITHDRAWALS_TARGET_ADDRESS=${withdrawalsTarget.address}`);
  console.log(`Deployment finished at block number: ${await hre.ethers.provider.getBlockNumber()}`);
  /* eslint-disable no-console */

  const contractAddresses = `
VITE_ALLOCATIONS_ADDRESS=${allocations.address}
VITE_ALLOCATIONS_STORAGE_ADDRESS=${allocationsStorage.address}
VITE_DEPOSITS_ADDRESS=${deposits.address}
VITE_TRACKER_ADDRESS=${tracker.address}
VITE_EPOCHS_ADDRESS=${epochs.address}
VITE_PROPOSALS_ADDRESS=${proposals.address}
VITE_REWARDS_ADDRESS=${rewards.address}
VITE_OCTANT_ORACLE_ADDRESS=${octantOracle.address}
VITE_OCTANT_PAYOUTS_MANAGER_ADDRESS=${payoutsManager.address}
VITE_OCTANT_PAYOUTS_ADDRESS=${payouts.address}
VITE_WITHDRAWALS_TARGET_ADDRESS=${withdrawalsTarget.address}
`; // Newline is intentional

  fs.appendFileSync('deployments/clientEnv', contractAddresses);
};

export default func;
func.tags = ['after-deployment', 'testnet', 'local'];
