import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import {
  ALLOCATIONS_STORAGE,
  DEPOSITS,
  EPOCHS,
  HEXAGON_ORACLE,
  PROPOSALS,
  TEST_REWARDS,
  TRACKER
} from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const epochs = await ethers.getContract(EPOCHS);
  const deposits = await ethers.getContract(DEPOSITS);
  const tracker = await ethers.getContract(TRACKER);
  const oracle = await ethers.getContract(HEXAGON_ORACLE);
  const proposals = await ethers.getContract(PROPOSALS);
  const allocationsStorage = await ethers.getContract(ALLOCATIONS_STORAGE);

  await deploy(TEST_REWARDS, {
    from: deployer,
    log: true,
    args: [epochs.address, deposits.address, tracker.address, oracle.address, proposals.address, allocationsStorage.address],
    autoMine: true
  });
};
export default func;
func.tags = ['rewards', 'local', 'test', 'goerli']; // SHOULD NOT be deployed to mainnet!
