import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import {
  ALLOCATIONS_STORAGE,
  OCTANT_ORACLE,
  PROPOSALS,
  REWARDS,
  TRACKER,
} from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const tracker = await ethers.getContract(TRACKER);
  const oracle = await ethers.getContract(OCTANT_ORACLE);
  const proposals = await ethers.getContract(PROPOSALS);
  const allocationsStorage = await ethers.getContract(ALLOCATIONS_STORAGE);

  await deploy(REWARDS, {
    args: [tracker.address, oracle.address, proposals.address, allocationsStorage.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['rewards', 'local', 'test', 'testnet'];
